import { DiffStrategy, DiffResult } from "../types"
import { addLineNumbers, everyLineHasLineNumbers, stripLineNumbers } from "../../../integrations/misc/extract-text"
import { distance } from "fastest-levenshtein"
import { ToolProgressStatus } from "../../../shared/ExtensionMessage"
import { ToolUse } from "../../assistant-message"

const BUFFER_LINES = 40 // Number of extra context lines to show before and after matches

function getSimilarity(original: string, search: string): number {
	if (search === "") {
		return 1
	}

	// Normalize strings by removing extra whitespace but preserve case
	const normalizeStr = (str: string) => str.replace(/\s+/g, " ").trim()

	const normalizedOriginal = normalizeStr(original)
	const normalizedSearch = normalizeStr(search)

	if (normalizedOriginal === normalizedSearch) {
		return 1
	}

	// Calculate Levenshtein distance using fastest-levenshtein's distance function
	const dist = distance(normalizedOriginal, normalizedSearch)

	// Calculate similarity ratio (0 to 1, where 1 is an exact match)
	const maxLength = Math.max(normalizedOriginal.length, normalizedSearch.length)
	return 1 - dist / maxLength
}

export class MultiSearchReplaceDiffStrategy implements DiffStrategy {
	private fuzzyThreshold: number
	private bufferLines: number

	getName(): string {
		return "MultiSearchReplace"
	}

	constructor(fuzzyThreshold?: number, bufferLines?: number) {
		// Use provided threshold or default to exact matching (1.0)
		// Note: fuzzyThreshold is inverted in UI (0% = 1.0, 10% = 0.9)
		// so we use it directly here
		this.fuzzyThreshold = fuzzyThreshold ?? 1.0
		this.bufferLines = bufferLines ?? BUFFER_LINES
	}

	getToolDescription(args: { cwd: string; toolOptions?: { [key: string]: string } }): string {
		return `## apply_diff
描述：请求使用搜索和替换块替换现有代码。
此工具通过精确指定要搜索的内容和要替换的内容，实现对文件进行精确、精细的替换。
该工具会在进行修改时保持适当的缩进和格式。
每次工具使用只允许一个操作。
SEARCH部分必须精确匹配现有内容，包括空格和缩进。
如果您不确定要搜索的确切内容，请先使用read_file工具获取确切内容。
在应用差异时，要特别注意记得更改任何可能受到文件中更远处差异影响的闭合括号或其他语法。
始终在单个'apply_diff'请求中使用多个SEARCH/REPLACE块尽可能多地进行更改

参数：
- path：（必需）要修改的文件路径（相对于当前工作目录${args.cwd}）
- diff：（必需）定义更改的搜索/替换块。

Diff格式：
\`\`\`
<<<<<<< SEARCH
:start_line: （必需）原始内容中搜索块开始的行号。
:end_line: （必需）原始内容中搜索块结束的行号。
-------
[要查找的精确内容，包括空格]
=======
[要替换成的新内容]
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
:start_line:1
:end_line:5
-------
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

多编辑的搜索/替换内容：
\`\`\`
<<<<<<< SEARCH
:start_line:1
:end_line:2
-------
def calculate_sum(items):
    sum = 0
=======
def calculate_sum(items):
    sum = 0
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:4
:end_line:5
-------
        total += item
    return total
=======
        sum += item
    return sum 
>>>>>>> REPLACE
\`\`\`

用法：
<apply_diff>
<path>在此处填写文件路径</path>
<diff>
在此处填写您的搜索/替换内容
您可以在一个diff块中使用多个搜索/替换块，但确保为每个块包含行号。
在搜索内容和替换内容之间只使用单行的'======='，因为多行'======='会损坏文件。
</diff>
</apply_diff>`
	}

	async applyDiff(
		originalContent: string,
		diffContent: string,
		_paramStartLine?: number,
		_paramEndLine?: number,
	): Promise<DiffResult> {
		let matches = [
			...diffContent.matchAll(
				/<<<<<<< SEARCH\n(:start_line:\s*(\d+)\n){0,1}(:end_line:\s*(\d+)\n){0,1}(-------\n){0,1}([\s\S]*?)\n?=======\n([\s\S]*?)\n?>>>>>>> REPLACE/g,
			),
		]

		if (matches.length === 0) {
			return {
				success: false,
				error: `Invalid diff format - missing required sections\n\nDebug Info:\n- Expected Format: <<<<<<< SEARCH\\n:start_line: start line\\n:end_line: end line\\n-------\\n[search content]\\n=======\\n[replace content]\\n>>>>>>> REPLACE\n- Tip: Make sure to include start_line/end_line/SEARCH/REPLACE sections with correct markers`,
			}
		}
		// Detect line ending from original content
		const lineEnding = originalContent.includes("\r\n") ? "\r\n" : "\n"
		let resultLines = originalContent.split(/\r?\n/)
		let delta = 0
		let diffResults: DiffResult[] = []
		let appliedCount = 0
		const replacements = matches
			.map((match) => ({
				startLine: Number(match[2] ?? 0),
				endLine: Number(match[4] ?? resultLines.length),
				searchContent: match[6],
				replaceContent: match[7],
			}))
			.sort((a, b) => a.startLine - b.startLine)

		for (let { searchContent, replaceContent, startLine, endLine } of replacements) {
			startLine += startLine === 0 ? 0 : delta
			endLine += delta

			// Strip line numbers from search and replace content if every line starts with a line number
			if (everyLineHasLineNumbers(searchContent) && everyLineHasLineNumbers(replaceContent)) {
				searchContent = stripLineNumbers(searchContent)
				replaceContent = stripLineNumbers(replaceContent)
			}

			// Split content into lines, handling both \n and \r\n
			const searchLines = searchContent === "" ? [] : searchContent.split(/\r?\n/)
			const replaceLines = replaceContent === "" ? [] : replaceContent.split(/\r?\n/)

			// Validate that empty search requires start line
			if (searchLines.length === 0 && !startLine) {
				diffResults.push({
					success: false,
					error: `Empty search content requires start_line to be specified\n\nDebug Info:\n- Empty search content is only valid for insertions at a specific line\n- For insertions, specify the line number where content should be inserted`,
				})
				continue
			}

			// Validate that empty search requires same start and end line
			if (searchLines.length === 0 && startLine && endLine && startLine !== endLine) {
				diffResults.push({
					success: false,
					error: `Empty search content requires start_line and end_line to be the same (got ${startLine}-${endLine})\n\nDebug Info:\n- Empty search content is only valid for insertions at a specific line\n- For insertions, use the same line number for both start_line and end_line`,
				})
				continue
			}

			// Initialize search variables
			let matchIndex = -1
			let bestMatchScore = 0
			let bestMatchContent = ""
			const searchChunk = searchLines.join("\n")

			// Determine search bounds
			let searchStartIndex = 0
			let searchEndIndex = resultLines.length

			// Validate and handle line range if provided
			if (startLine && endLine) {
				// Convert to 0-based index
				const exactStartIndex = startLine - 1
				const exactEndIndex = endLine - 1

				if (exactStartIndex < 0 || exactEndIndex > resultLines.length || exactStartIndex > exactEndIndex) {
					diffResults.push({
						success: false,
						error: `Line range ${startLine}-${endLine} is invalid (file has ${resultLines.length} lines)\n\nDebug Info:\n- Requested Range: lines ${startLine}-${endLine}\n- File Bounds: lines 1-${resultLines.length}`,
					})
					continue
				}

				// Try exact match first
				const originalChunk = resultLines.slice(exactStartIndex, exactEndIndex + 1).join("\n")
				const similarity = getSimilarity(originalChunk, searchChunk)
				if (similarity >= this.fuzzyThreshold) {
					matchIndex = exactStartIndex
					bestMatchScore = similarity
					bestMatchContent = originalChunk
				} else {
					// Set bounds for buffered search
					searchStartIndex = Math.max(0, startLine - (this.bufferLines + 1))
					searchEndIndex = Math.min(resultLines.length, endLine + this.bufferLines)
				}
			}

			// If no match found yet, try middle-out search within bounds
			if (matchIndex === -1) {
				const midPoint = Math.floor((searchStartIndex + searchEndIndex) / 2)
				let leftIndex = midPoint
				let rightIndex = midPoint + 1

				// Search outward from the middle within bounds
				while (leftIndex >= searchStartIndex || rightIndex <= searchEndIndex - searchLines.length) {
					// Check left side if still in range
					if (leftIndex >= searchStartIndex) {
						const originalChunk = resultLines.slice(leftIndex, leftIndex + searchLines.length).join("\n")
						const similarity = getSimilarity(originalChunk, searchChunk)
						if (similarity > bestMatchScore) {
							bestMatchScore = similarity
							matchIndex = leftIndex
							bestMatchContent = originalChunk
						}
						leftIndex--
					}

					// Check right side if still in range
					if (rightIndex <= searchEndIndex - searchLines.length) {
						const originalChunk = resultLines.slice(rightIndex, rightIndex + searchLines.length).join("\n")
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

			// Require similarity to meet threshold
			if (matchIndex === -1 || bestMatchScore < this.fuzzyThreshold) {
				const searchChunk = searchLines.join("\n")
				const originalContentSection =
					startLine !== undefined && endLine !== undefined
						? `\n\nOriginal Content:\n${addLineNumbers(
								resultLines
									.slice(
										Math.max(0, startLine - 1 - this.bufferLines),
										Math.min(resultLines.length, endLine + this.bufferLines),
									)
									.join("\n"),
								Math.max(1, startLine - this.bufferLines),
							)}`
						: `\n\nOriginal Content:\n${addLineNumbers(resultLines.join("\n"))}`

				const bestMatchSection = bestMatchContent
					? `\n\nBest Match Found:\n${addLineNumbers(bestMatchContent, matchIndex + 1)}`
					: `\n\nBest Match Found:\n(no match)`

				const lineRange =
					startLine || endLine
						? ` at ${startLine ? `start: ${startLine}` : "start"} to ${endLine ? `end: ${endLine}` : "end"}`
						: ""

				diffResults.push({
					success: false,
					error: `No sufficiently similar match found${lineRange} (${Math.floor(bestMatchScore * 100)}% similar, needs ${Math.floor(this.fuzzyThreshold * 100)}%)\n\nDebug Info:\n- Similarity Score: ${Math.floor(bestMatchScore * 100)}%\n- Required Threshold: ${Math.floor(this.fuzzyThreshold * 100)}%\n- Search Range: ${startLine && endLine ? `lines ${startLine}-${endLine}` : "start to end"}\n- Tip: Use read_file to get the latest content of the file before attempting the diff again, as the file content may have changed\n\nSearch Content:\n${searchChunk}${bestMatchSection}${originalContentSection}`,
				})
				continue
			}

			// Get the matched lines from the original content
			const matchedLines = resultLines.slice(matchIndex, matchIndex + searchLines.length)

			// Get the exact indentation (preserving tabs/spaces) of each line
			const originalIndents = matchedLines.map((line) => {
				const match = line.match(/^[\t ]*/)
				return match ? match[0] : ""
			})

			// Get the exact indentation of each line in the search block
			const searchIndents = searchLines.map((line) => {
				const match = line.match(/^[\t ]*/)
				return match ? match[0] : ""
			})

			// Apply the replacement while preserving exact indentation
			const indentedReplaceLines = replaceLines.map((line, i) => {
				// Get the matched line's exact indentation
				const matchedIndent = originalIndents[0] || ""

				// Get the current line's indentation relative to the search content
				const currentIndentMatch = line.match(/^[\t ]*/)
				const currentIndent = currentIndentMatch ? currentIndentMatch[0] : ""
				const searchBaseIndent = searchIndents[0] || ""

				// Calculate the relative indentation level
				const searchBaseLevel = searchBaseIndent.length
				const currentLevel = currentIndent.length
				const relativeLevel = currentLevel - searchBaseLevel

				// If relative level is negative, remove indentation from matched indent
				// If positive, add to matched indent
				const finalIndent =
					relativeLevel < 0
						? matchedIndent.slice(0, Math.max(0, matchedIndent.length + relativeLevel))
						: matchedIndent + currentIndent.slice(searchBaseLevel)

				return finalIndent + line.trim()
			})

			// Construct the final content
			const beforeMatch = resultLines.slice(0, matchIndex)
			const afterMatch = resultLines.slice(matchIndex + searchLines.length)
			resultLines = [...beforeMatch, ...indentedReplaceLines, ...afterMatch]
			delta = delta - matchedLines.length + replaceLines.length
			appliedCount++
		}
		const finalContent = resultLines.join(lineEnding)
		if (appliedCount === 0) {
			return {
				success: false,
				failParts: diffResults,
			}
		}
		return {
			success: true,
			content: finalContent,
			failParts: diffResults,
		}
	}

	getProgressStatus(toolUse: ToolUse, result?: DiffResult): ToolProgressStatus {
		const diffContent = toolUse.params.diff
		if (diffContent) {
			const icon = "diff-multiple"
			const searchBlockCount = (diffContent.match(/SEARCH/g) || []).length
			if (toolUse.partial) {
				if (diffContent.length < 1000 || (diffContent.length / 50) % 10 === 0) {
					return { icon, text: `${searchBlockCount}` }
				}
			} else if (result) {
				if (result.failParts?.length) {
					return {
						icon,
						text: `${searchBlockCount - result.failParts.length}/${searchBlockCount}`,
					}
				} else {
					return { icon, text: `${searchBlockCount}` }
				}
			}
		}
		return {}
	}
}
