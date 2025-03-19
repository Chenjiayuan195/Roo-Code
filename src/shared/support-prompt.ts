// 支持提示
type PromptParams = Record<string, string | any[]>

const generateDiagnosticText = (diagnostics?: any[]) => {
	if (!diagnostics?.length) return ""
	return `\n检测到当前问题：\n${diagnostics
		.map((d) => `- [${d.source || "错误"}] ${d.message}${d.code ? ` (${d.code})` : ""}`)
		.join("\n")}`
}

export const createPrompt = (template: string, params: PromptParams): string => {
	let result = template
	for (const [key, value] of Object.entries(params)) {
		if (key === "diagnostics") {
			result = result.replaceAll("${diagnosticText}", generateDiagnosticText(value as any[]))
		} else {
			result = result.replaceAll(`\${${key}}`, value as string)
		}
	}

	// 将任何剩余的占位符替换为空字符串
	result = result.replaceAll(/\${[^}]*}/g, "")

	return result
}

interface SupportPromptConfig {
	label: string
	description: string
	template: string
}

const supportPromptConfigs: Record<string, SupportPromptConfig> = {
	ENHANCE: {
		label: "增强提示",
		description:
			"使用提示增强功能获取为您的输入量身定制的建议或改进。这确保了Magic理解您的意图并提供最佳响应。可通过聊天中的✨图标使用。",
		template: `生成此提示的增强版本（仅回复增强的提示 - 不包含对话、解释、引导、项目符号、占位符或引号）：

\${userInput}`,
	},
	EXPLAIN: {
		label: "解释代码",
		description:
			"获取代码片段、函数或整个文件的详细解释。对于理解复杂代码或学习新模式很有用。可在代码操作（编辑器中的灯泡图标）和编辑器上下文菜单（右键单击选定的代码）中使用。",
		template: `解释以下来自文件路径 @/\${filePath} 的代码：
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

请提供清晰简洁的解释，说明这段代码的功能，包括：
1. 目的和功能
2. 关键组件及其交互
3. 使用的重要模式或技术`,
	},
	FIX: {
		label: "修复问题",
		description:
			"获取帮助识别和解决错误、问题或代码质量问题。提供逐步指导以修复问题。可在代码操作（编辑器中的灯泡图标）和编辑器上下文菜单（右键单击选定的代码）中使用。",
		template: `修复以下来自文件路径 @/\${filePath} 的代码中的任何问题
\${diagnosticText}
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

请：
1. 解决上面列出的所有检测到的问题（如果有）
2. 识别任何其他潜在的错误或问题
3. 提供修正后的代码
4. 解释修复了什么以及为什么`,
	},
	IMPROVE: {
		label: "改进代码",
		description:
			"获取代码优化、更好的实践和架构改进的建议，同时保持功能性。可在代码操作（编辑器中的灯泡图标）和编辑器上下文菜单（右键单击选定的代码）中使用。",
		template: `改进以下来自文件路径 @/\${filePath} 的代码：
\${userInput}

\`\`\`
\${selectedText}
\`\`\`

请为以下方面提供改进建议：
1. 代码可读性和可维护性
2. 性能优化
3. 最佳实践和模式
4. 错误处理和边缘情况

提供改进后的代码，并解释每项增强。`,
	},
	ADD_TO_CONTEXT: {
		label: "添加到上下文",
		description:
			"为当前任务或对话添加上下文。用于提供额外信息或说明。可在代码操作（编辑器中的灯泡图标）和编辑器上下文菜单（右键单击选定的代码）中使用。",
		template: `\${filePath}:
\`\`\`
\${selectedText}
\`\`\``,
	},
	TERMINAL_ADD_TO_CONTEXT: {
		label: "添加终端内容到上下文",
		description:
			"将终端输出添加到当前任务或对话中。用于提供命令输出或日志。可在终端上下文菜单（右键单击选定的终端内容）中使用。",
		template: `\${userInput}
终端输出：
\`\`\`
\${terminalContent}
\`\`\``,
	},
	TERMINAL_FIX: {
		label: "修复终端命令",
		description: "获取帮助修复失败或需要改进的终端命令。可在终端上下文菜单（右键单击选定的终端内容）中使用。",
		template: `\${userInput}
修复这个终端命令：
\`\`\`
\${terminalContent}
\`\`\`

请：
1. 识别命令中的任何问题
2. 提供修正后的命令
3. 解释修复了什么以及为什么`,
	},
	TERMINAL_EXPLAIN: {
		label: "解释终端命令",
		description: "获取终端命令及其输出的详细解释。可在终端上下文菜单（右键单击选定的终端内容）中使用。",
		template: `\${userInput}
解释这个终端命令：
\`\`\`
\${terminalContent}
\`\`\`

请提供：
1. 这个命令的作用
2. 每个部分/标志的解释
3. 预期的输出和行为`,
	},
} as const

type SupportPromptType = keyof typeof supportPromptConfigs

export const supportPrompt = {
	default: Object.fromEntries(Object.entries(supportPromptConfigs).map(([key, config]) => [key, config.template])),
	get: (customSupportPrompts: Record<string, any> | undefined, type: SupportPromptType): string => {
		return customSupportPrompts?.[type] ?? supportPromptConfigs[type].template
	},
	create: (type: SupportPromptType, params: PromptParams, customSupportPrompts?: Record<string, any>): string => {
		const template = supportPrompt.get(customSupportPrompts, type)
		return createPrompt(template, params)
	},
} as const

export type { SupportPromptType }

// 为UI导出标签和描述
export const supportPromptLabels = Object.fromEntries(
	Object.entries(supportPromptConfigs).map(([key, config]) => [key, config.label]),
) as Record<SupportPromptType, string>

export const supportPromptDescriptions = Object.fromEntries(
	Object.entries(supportPromptConfigs).map(([key, config]) => [key, config.description]),
) as Record<SupportPromptType, string>

export type CustomSupportPrompts = {
	[key: string]: string | undefined
}
