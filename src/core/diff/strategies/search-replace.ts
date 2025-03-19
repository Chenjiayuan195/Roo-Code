import { DiffStrategy, DiffResult } from "../types"
import { addLineNumbers, everyLineHasLineNumbers, stripLineNumbers } from "../../../integrations/misc/extract-text"
import { distance } from "fastest-levenshtein"

const BUFFER_LINES = 20 // 在匹配前后显示的额外上下文行数

function getSimilarity(original: string, search: string): number {
	if (search === "") {
		return 1
	}

	// 通过删除多余空格来标准化字符串，但保留大小写
	const normalizeStr = (str: string) => str.replace(/\s+/g, " ").trim()

	const normalizedOriginal = normalizeStr(original)
	const normalizedSearch = normalizeStr(search)

	if (normalizedOriginal === normalizedSearch) {
		return 1
	}

	// 使用fastest-levenshtein的distance函数计算Levenshtein距离
	const dist = distance(normalizedOriginal, normalizedSearch)

	// 计算相似度比率（0到1，其中1表示完全匹配）
	const maxLength = Math.max(normalizedOriginal.length, normalizedSearch.length)
	return 1 - dist / maxLength
}

export class SearchReplaceDiffStrategy implements DiffStrategy {
	private fuzzyThreshold: number
	private bufferLines: number

	getName(): string {
		return "SearchReplace"
	}

	constructor(fuzzyThreshold?: number, bufferLines?: number) {
		// 使用提供的阈值或默认为精确匹配（1.0）
		// 注意：fuzzyThreshold在UI中是反向的（0% = 1.0，10% = 0.9）
		// 所以我们在这里直接使用它
		this.fuzzyThreshold = fuzzyThreshold ?? 1.0
		this.bufferLines = bufferLines ?? BUFFER_LINES
	}

	getToolDescription(args: { cwd: string; toolOptions?: { [key: string]: string } }): string {
		return `## apply_diff
描述：请求使用搜索和替换块替换现有代码。
此工具通过精确指定要搜索的内容和要替换的内容，可以对文件进行精确、外科手术式的替换。
该工具在进行更改时将保持适当的缩进和格式。
每次工具使用仅允许一个操作。
SEARCH部分必须与现有内容完全匹配，包括空格和缩进。
如果您不确定要搜索的确切内容，请先使用read_file工具获取确切内容。
在应用差异时，请特别注意记得更改可能受到文件中更下方差异影响的任何闭合括号或其他语法。

参数：
- path：（必需）要修改的文件路径（相对于当前工作目录${args.cwd}）
- diff：（必需）定义更改的搜索/替换块。
- start_line：（必需）搜索块开始的行号。
- end_line：（必需）搜索块结束的行号。

差异格式：
\`\`\`
<<<<<<< SEARCH
[要查找的确切内容，包括空格]
=======
[要替换的新内容]
>>>>>>> REPLACE
\`\`\`

示例：

原始文件：
\`\`\`
1 | def calculate_total(items):
2 |     total = 0
3 |     for item in items:
4 |         total += item
5 |     return total
\`\`\`

搜索/替换内容：
\`\`\`
<<<<<<< SEARCH
def calculate_total(items):
    total = 0
    for item in items:
        total += item
    return total
=======
def calculate_total(items):
    """Calculate total with 10% markup"""
    return sum(item * 1.1 for item in items)
>>>>>>> REPLACE
\`\`\`

用法：
<apply_diff>
<path>此处为文件路径</path>
<diff>
此处为您的搜索/替换内容
</diff>
<start_line>1</start_line>
<end_line>5</end_line>
</apply_diff>`
	}

	async applyDiff(
		originalContent: string,
		diffContent: string,
		startLine?: number,
		endLine?: number,
	): Promise<DiffResult> {
		// 提取搜索和替换块
		const match = diffContent.match(/<<<<<<< SEARCH\n([\s\S]*?)\n?=======\n([\s\S]*?)\n?>>>>>>> REPLACE/)
		if (!match) {
			return {
				success: false,
				error: `无效的差异格式 - 缺少必需的SEARCH/REPLACE部分\n\n调试信息：\n- 预期格式：<<<<<<< SEARCH\\n[搜索内容]\\n=======\\n[替换内容]\\n>>>>>>> REPLACE\n- 提示：确保包含带有正确标记的SEARCH和REPLACE部分`,
			}
		}

		let [_, searchContent, replaceContent] = match

		// 从原始内容检测行结束符
		const lineEnding = originalContent.includes("\r\n") ? "\r\n" : "\n"

		// 如果每行都以行号开头，则从搜索和替换内容中去除行号
		if (everyLineHasLineNumbers(searchContent) && everyLineHasLineNumbers(replaceContent)) {
			searchContent = stripLineNumbers(searchContent)
			replaceContent = stripLineNumbers(replaceContent)
		}

		// 将内容拆分为行，处理\n和\r\n
		const searchLines = searchContent === "" ? [] : searchContent.split(/\r?\n/)
		const replaceLines = replaceContent === "" ? [] : replaceContent.split(/\r?\n/)
		const originalLines = originalContent.split(/\r?\n/)

		// 验证空搜索需要起始行
		if (searchLines.length === 0 && !startLine) {
			return {
				success: false,
				error: `空搜索内容需要指定start_line\n\n调试信息：\n- 空搜索内容仅对特定行的插入有效\n- 对于插入，请指定应插入内容的行号`,
			}
		}

		// 验证空搜索需要相同的起始和结束行
		if (searchLines.length === 0 && startLine && endLine && startLine !== endLine) {
			return {
				success: false,
				error: `空搜索内容要求start_line和end_line相同（得到${startLine}-${endLine}）\n\n调试信息：\n- 空搜索内容仅对特定行的插入有效\n- 对于插入，start_line和end_line使用相同的行号`,
			}
		}

		// 初始化搜索变量
		let matchIndex = -1
		let bestMatchScore = 0
		let bestMatchContent = ""
		const searchChunk = searchLines.join("\n")

		// 确定搜索范围
		let searchStartIndex = 0
		let searchEndIndex = originalLines.length

		// 验证并处理提供的行范围
		if (startLine && endLine) {
			// 转换为基于0的索引
			const exactStartIndex = startLine - 1
			const exactEndIndex = endLine - 1

			if (exactStartIndex < 0 || exactEndIndex > originalLines.length || exactStartIndex > exactEndIndex) {
				return {
					success: false,
					error: `行范围${startLine}-${endLine}无效（文件有${originalLines.length}行）\n\n调试信息：\n- 请求的范围：第${startLine}-${endLine}行\n- 文件边界：第1-${originalLines.length}行`,
				}
			}

			// 首先尝试精确匹配
			const originalChunk = originalLines.slice(exactStartIndex, exactEndIndex + 1).join("\n")
			const similarity = getSimilarity(originalChunk, searchChunk)
			if (similarity >= this.fuzzyThreshold) {
				matchIndex = exactStartIndex
				bestMatchScore = similarity
				bestMatchContent = originalChunk
			} else {
				// 设置缓冲搜索的边界
				searchStartIndex = Math.max(0, startLine - (this.bufferLines + 1))
				searchEndIndex = Math.min(originalLines.length, endLine + this.bufferLines)
			}
		}

		// 如果尚未找到匹配项，则在边界内尝试从中间向外搜索
		if (matchIndex === -1) {
			const midPoint = Math.floor((searchStartIndex + searchEndIndex) / 2)
			let leftIndex = midPoint
			let rightIndex = midPoint + 1

			// 在边界内从中间向外搜索
			while (leftIndex >= searchStartIndex || rightIndex <= searchEndIndex - searchLines.length) {
				// 如果仍在范围内，检查左侧
				if (leftIndex >= searchStartIndex) {
					const originalChunk = originalLines.slice(leftIndex, leftIndex + searchLines.length).join("\n")
					const similarity = getSimilarity(originalChunk, searchChunk)
					if (similarity > bestMatchScore) {
						bestMatchScore = similarity
						matchIndex = leftIndex
						bestMatchContent = originalChunk
					}
					leftIndex--
				}

				// 如果仍在范围内，检查右侧
				if (rightIndex <= searchEndIndex - searchLines.length) {
					const originalChunk = originalLines.slice(rightIndex, rightIndex + searchLines.length).join("\n")
					const similarity = getSimilarity(originalChunk, searchChunk)
					if (similarity > bestMatchScore) {
						bestMatchScore = similarity
						matchIndex = rightIndex
						bestMatchContent = originalChunk
					}
					rightIndex++
				}
			}
		}

		// 要求相似度达到阈值
		if (matchIndex === -1 || bestMatchScore < this.fuzzyThreshold) {
			const searchChunk = searchLines.join("\n")
			const originalContentSection =
				startLine !== undefined && endLine !== undefined
					? `\n\n原始内容：\n${addLineNumbers(
							originalLines
								.slice(
									Math.max(0, startLine - 1 - this.bufferLines),
									Math.min(originalLines.length, endLine + this.bufferLines),
								)
								.join("\n"),
							Math.max(1, startLine - this.bufferLines),
						)}`
					: `\n\n原始内容：\n${addLineNumbers(originalLines.join("\n"))}`

			const bestMatchSection = bestMatchContent
				? `\n\n找到的最佳匹配：\n${addLineNumbers(bestMatchContent, matchIndex + 1)}`
				: `\n\n找到的最佳匹配：\n(无匹配)`

			const lineRange =
				startLine || endLine
					? ` 在 ${startLine ? `开始：${startLine}` : "开始"} 到 ${endLine ? `结束：${endLine}` : "结束"}`
					: ""
			return {
				success: false,
				error: `未找到足够相似的匹配${lineRange}（${Math.floor(bestMatchScore * 100)}%相似，需要${Math.floor(this.fuzzyThreshold * 100)}%）\n\n调试信息：\n- 相似度分数：${Math.floor(bestMatchScore * 100)}%\n- 所需阈值：${Math.floor(this.fuzzyThreshold * 100)}%\n- 搜索范围：${startLine && endLine ? `第${startLine}-${endLine}行` : "从头到尾"}\n- 提示：在再次尝试差异之前，使用read_file获取文件的最新内容，因为文件内容可能已更改\n\n搜索内容：\n${searchChunk}${bestMatchSection}${originalContentSection}`,
			}
		}

		// 从原始内容获取匹配的行
		const matchedLines = originalLines.slice(matchIndex, matchIndex + searchLines.length)

		// 获取每行的确切缩进（保留制表符/空格）
		const originalIndents = matchedLines.map((line) => {
			const match = line.match(/^[\t ]*/)
			return match ? match[0] : ""
		})

		// 获取搜索块中每行的确切缩进
		const searchIndents = searchLines.map((line) => {
			const match = line.match(/^[\t ]*/)
			return match ? match[0] : ""
		})

		// 应用替换，同时保留确切的缩进
		const indentedReplaceLines = replaceLines.map((line, i) => {
			// 获取匹配行的确切缩进
			const matchedIndent = originalIndents[0] || ""

			// 获取当前行相对于搜索内容的缩进
			const currentIndentMatch = line.match(/^[\t ]*/)
			const currentIndent = currentIndentMatch ? currentIndentMatch[0] : ""
			const searchBaseIndent = searchIndents[0] || ""

			// 计算相对缩进级别
			const searchBaseLevel = searchBaseIndent.length
			const currentLevel = currentIndent.length
			const relativeLevel = currentLevel - searchBaseLevel

			// 如果相对级别为负，从匹配的缩进中删除缩进
			// 如果为正，添加到匹配的缩进
			const finalIndent =
				relativeLevel < 0
					? matchedIndent.slice(0, Math.max(0, matchedIndent.length + relativeLevel))
					: matchedIndent + currentIndent.slice(searchBaseLevel)

			return finalIndent + line.trim()
		})

		// 构建最终内容
		const beforeMatch = originalLines.slice(0, matchIndex)
		const afterMatch = originalLines.slice(matchIndex + searchLines.length)

		const finalContent = [...beforeMatch, ...indentedReplaceLines, ...afterMatch].join(lineEnding)
		return {
			success: true,
			content: finalContent,
		}
	}
}
