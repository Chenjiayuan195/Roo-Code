import * as vscode from "vscode"

import { ACTION_NAMES, COMMAND_IDS } from "../core/CodeActionProvider"
import { EditorUtils } from "../core/EditorUtils"
import { ClineProvider } from "../core/webview/ClineProvider"

export const registerCodeActions = (context: vscode.ExtensionContext) => {
	registerCodeActionPair(
		context,
		COMMAND_IDS.EXPLAIN,
		"EXPLAIN",
		"您希望Magic解释什么？",
		"例如：错误处理是如何工作的？",
	)

	registerCodeActionPair(context, COMMAND_IDS.FIX, "FIX", "您希望Magic修复什么？", "例如：保持向后兼容性")

	registerCodeActionPair(context, COMMAND_IDS.IMPROVE, "IMPROVE", "您希望Magic改进什么？", "例如：专注于性能优化")

	registerCodeAction(context, COMMAND_IDS.ADD_TO_CONTEXT, "ADD_TO_CONTEXT")
}

const registerCodeAction = (
	context: vscode.ExtensionContext,
	command: string,
	promptType: keyof typeof ACTION_NAMES,
	inputPrompt?: string,
	inputPlaceholder?: string,
) => {
	let userInput: string | undefined

	context.subscriptions.push(
		vscode.commands.registerCommand(command, async (...args: any[]) => {
			if (inputPrompt) {
				userInput = await vscode.window.showInputBox({
					prompt: inputPrompt,
					placeHolder: inputPlaceholder,
				})
			}

			// 处理代码操作和直接命令两种情况
			let filePath: string
			let selectedText: string
			let diagnostics: any[] | undefined

			if (args.length > 1) {
				// 从代码操作调用
				;[filePath, selectedText, diagnostics] = args
			} else {
				// 直接从命令面板调用
				const context = EditorUtils.getEditorContext()
				if (!context) return
				;({ filePath, selectedText, diagnostics } = context)
			}

			const params = {
				...{ filePath, selectedText },
				...(diagnostics ? { diagnostics } : {}),
				...(userInput ? { userInput } : {}),
			}

			await ClineProvider.handleCodeAction(command, promptType, params)
		}),
	)
}

const registerCodeActionPair = (
	context: vscode.ExtensionContext,
	baseCommand: string,
	promptType: keyof typeof ACTION_NAMES,
	inputPrompt?: string,
	inputPlaceholder?: string,
) => {
	// 注册新任务版本
	registerCodeAction(context, baseCommand, promptType, inputPrompt, inputPlaceholder)

	// 注册当前任务版本
	registerCodeAction(context, `${baseCommand}InCurrentTask`, promptType, inputPrompt, inputPlaceholder)
}
