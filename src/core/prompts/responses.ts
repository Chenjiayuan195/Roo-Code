import { Anthropic } from "@anthropic-ai/sdk"
import * as path from "path"
import * as diff from "diff"
import { RooIgnoreController, LOCK_TEXT_SYMBOL } from "../ignore/RooIgnoreController"

export const formatResponse = {
	toolDenied: () => `用户拒绝了此操作。`,

	toolDeniedWithFeedback: (feedback?: string) =>
		`用户拒绝了此操作并提供了以下反馈：\n<feedback>\n${feedback}\n</feedback>`,

	toolApprovedWithFeedback: (feedback?: string) =>
		`用户批准了此操作并提供了以下上下文：\n<feedback>\n${feedback}\n</feedback>`,

	toolError: (error?: string) => `工具执行失败，出现以下错误：\n<e>\n${error}\n</e>`,

	rooIgnoreError: (path: string) =>
		`由于.rooignore文件设置，访问${path}被阻止。您必须尝试在不使用此文件的情况下继续任务，或者请用户更新.rooignore文件。`,

	noToolsUsed: () =>
		`[错误] 您在上一个回复中没有使用工具！请使用工具重试。

${toolUseInstructionsReminder}

# 下一步

如果您已完成用户的任务，请使用 attempt_completion 工具。
如果您需要从用户获取更多信息，请使用 ask_followup_question 工具。
否则，如果您尚未完成任务且不需要额外信息，则继续执行任务的下一步。
(这是一条自动消息，所以不要进行对话式回复。)`,

	tooManyMistakes: (feedback?: string) =>
		`您似乎在进行中遇到困难。用户提供了以下反馈来帮助指导您：\n<feedback>\n${feedback}\n</feedback>`,

	missingToolParameterError: (paramName: string) =>
		`缺少必需参数'${paramName}'的值。请使用完整响应重试。\n\n${toolUseInstructionsReminder}`,

	invalidMcpToolArgumentError: (serverName: string, toolName: string) =>
		`${serverName}的${toolName}使用了无效的JSON参数。请使用格式正确的JSON参数重试。`,

	toolResult: (
		text: string,
		images?: string[],
	): string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> => {
		if (images && images.length > 0) {
			const textBlock: Anthropic.TextBlockParam = { type: "text", text }
			const imageBlocks: Anthropic.ImageBlockParam[] = formatImagesIntoBlocks(images)
			// 将图像放在文本后面可以获得更好的结果
			return [textBlock, ...imageBlocks]
		} else {
			return text
		}
	},

	imageBlocks: (images?: string[]): Anthropic.ImageBlockParam[] => {
		return formatImagesIntoBlocks(images)
	},

	formatFilesList: (
		absolutePath: string,
		files: string[],
		didHitLimit: boolean,
		rooIgnoreController: RooIgnoreController | undefined,
		showRooIgnoredFiles: boolean,
	): string => {
		const sorted = files
			.map((file) => {
				// 将绝对路径转换为相对路径
				const relativePath = path.relative(absolutePath, file).toPosix()
				return file.endsWith("/") ? relativePath + "/" : relativePath
			})
			// 对文件进行排序，使文件列在其各自目录下，以明确哪些文件是哪些目录的子文件。由于我们自上而下构建文件列表，即使文件列表被截断，它也会显示客户端可以进一步探索的目录。
			.sort((a, b) => {
				const aParts = a.split("/") // 仅在先使用toPosix时有效
				const bParts = b.split("/")
				for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
					if (aParts[i] !== bParts[i]) {
						// 如果在此级别上一个是目录而另一个不是，则先排序目录
						if (i + 1 === aParts.length && i + 1 < bParts.length) {
							return -1
						}
						if (i + 1 === bParts.length && i + 1 < aParts.length) {
							return 1
						}
						// 否则，按字母顺序排序
						return aParts[i].localeCompare(bParts[i], undefined, { numeric: true, sensitivity: "base" })
					}
				}
				// 如果所有部分直到较短路径的长度都相同，
				// 则较短的路径先出现
				return aParts.length - bParts.length
			})

		let rooIgnoreParsed: string[] = sorted

		if (rooIgnoreController) {
			rooIgnoreParsed = []
			for (const filePath of sorted) {
				// 路径相对于绝对路径，而不是cwd
				// validateAccess期望相对于cwd的路径或绝对路径
				// 否则，对于验证类似"assets/icons"的忽略模式，我们将只得到"icons"，这将导致路径不被忽略。
				const absoluteFilePath = path.resolve(absolutePath, filePath)
				const isIgnored = !rooIgnoreController.validateAccess(absoluteFilePath)

				if (isIgnored) {
					// 如果文件被忽略且我们不显示被忽略的文件，则跳过它
					if (!showRooIgnoredFiles) {
						continue
					}
					// 否则，用锁定符号标记它
					rooIgnoreParsed.push(LOCK_TEXT_SYMBOL + " " + filePath)
				} else {
					rooIgnoreParsed.push(filePath)
				}
			}
		}
		if (didHitLimit) {
			return `${rooIgnoreParsed.join(
				"\n",
			)}\n\n(文件列表已截断。如果需要进一步探索，请对特定子目录使用list_files。)`
		} else if (rooIgnoreParsed.length === 0 || (rooIgnoreParsed.length === 1 && rooIgnoreParsed[0] === "")) {
			return "未找到文件。"
		} else {
			return rooIgnoreParsed.join("\n")
		}
	},

	createPrettyPatch: (filename = "file", oldStr?: string, newStr?: string) => {
		// 字符串不能为undefined，否则diff会抛出异常
		const patch = diff.createPatch(filename.toPosix(), oldStr || "", newStr || "")
		const lines = patch.split("\n")
		const prettyPatchLines = lines.slice(4)
		return prettyPatchLines.join("\n")
	},
}

// 为避免循环依赖
const formatImagesIntoBlocks = (images?: string[]): Anthropic.ImageBlockParam[] => {
	return images
		? images.map((dataUrl) => {
				// data:image/png;base64,base64string
				const [rest, base64] = dataUrl.split(",")
				const mimeType = rest.split(":")[1].split(";")[0]
				return {
					type: "image",
					source: { type: "base64", media_type: mimeType, data: base64 },
				} as Anthropic.ImageBlockParam
			})
		: []
}

const toolUseInstructionsReminder = `# 提示：工具使用说明

工具使用通过XML风格的标签格式化。工具名称包含在开始和结束标签中，每个参数也包含在其自己的标签集中。结构如下：

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>

例如：

<attempt_completion>
<r>
我已完成任务...
</r>
</attempt_completion>

所有工具使用均应遵循此格式，以确保正确解析和执行。`
