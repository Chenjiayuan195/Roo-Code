import fs from "fs/promises"
import path from "path"
import * as vscode from "vscode"

async function safeReadFile(filePath: string): Promise<string> {
	try {
		const content = await fs.readFile(filePath, "utf-8")
		return content.trim()
	} catch (err) {
		const errorCode = (err as NodeJS.ErrnoException).code
		if (!errorCode || !["ENOENT", "EISDIR"].includes(errorCode)) {
			throw err
		}
		return ""
	}
}

export async function loadRuleFiles(cwd: string): Promise<string> {
	const ruleFiles = [".clinerules", ".cursorrules", ".windsurfrules"]
	let combinedRules = ""

	for (const file of ruleFiles) {
		const content = await safeReadFile(path.join(cwd, file))
		if (content) {
			combinedRules += `\n# 来自${file}的规则：\n${content}\n`
		}
	}

	return combinedRules
}

export async function addCustomInstructions(
	modeCustomInstructions: string,
	globalCustomInstructions: string,
	cwd: string,
	mode: string,
	options: { language?: string; rooIgnoreInstructions?: string } = {},
): Promise<string> {
	const sections = []

	// Load mode-specific rules if mode is provided
	let modeRuleContent = ""
	if (mode) {
		const modeRuleFile = `.clinerules-${mode}`
		modeRuleContent = await safeReadFile(path.join(cwd, modeRuleFile))
	}

	// Add language preference if provided
	if (options.language) {
		sections.push(
			`语言偏好：\n您应该始终用"${options.language}"语言说话和思考，除非用户在下面提供指令要求您用其他语言。`,
		)
	}

	// Add global instructions first
	if (typeof globalCustomInstructions === "string" && globalCustomInstructions.trim()) {
		sections.push(`全局指令：\n${globalCustomInstructions.trim()}`)
	}

	// Add mode-specific instructions after
	if (typeof modeCustomInstructions === "string" && modeCustomInstructions.trim()) {
		sections.push(`模式特定指令：\n${modeCustomInstructions.trim()}`)
	}

	// Add rules - include both mode-specific and generic rules if they exist
	const rules = []

	// Add mode-specific rules first if they exist
	if (modeRuleContent && modeRuleContent.trim()) {
		const modeRuleFile = `.clinerules-${mode}`
		rules.push(`# 来自${modeRuleFile}的规则：\n${modeRuleContent}`)
	}

	if (options.rooIgnoreInstructions) {
		rules.push(options.rooIgnoreInstructions)
	}

	// Add generic rules
	const genericRuleContent = await loadRuleFiles(cwd)
	if (genericRuleContent && genericRuleContent.trim()) {
		rules.push(genericRuleContent.trim())
	}

	if (rules.length > 0) {
		sections.push(`规则：\n\n${rules.join("\n\n")}`)
	}

	const joinedSections = sections.join("\n\n")

	return joinedSections
		? `
====

用户提供的附加指令

以下附加指令由用户提供，应尽可能遵循，但不要干扰工具使用指南。

${joinedSections}`
		: ""
}
