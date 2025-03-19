import * as path from "path"
import * as vscode from "vscode"
import { promises as fs } from "fs"
import { ModeConfig, getAllModesWithPrompts } from "../../../shared/modes"

export async function getModesSection(context: vscode.ExtensionContext): Promise<string> {
	const settingsDir = path.join(context.globalStorageUri.fsPath, "settings")
	await fs.mkdir(settingsDir, { recursive: true })
	const customModesPath = path.join(settingsDir, "cline_custom_modes.json")

	// Get all modes with their overrides from extension state
	const allModes = await getAllModesWithPrompts(context)

	// Get enableCustomModeCreation setting from extension state
	const shouldEnableCustomModeCreation = (await context.globalState.get<boolean>("enableCustomModeCreation")) ?? true

	let modesContent = `====

模式

- 以下是当前可用的模式:
${allModes.map((mode: ModeConfig) => `  * "${mode.name}" 模式 (${mode.slug}) - ${mode.roleDefinition.split(".")[0]}`).join("\n")}`

	// Only include custom modes documentation if the feature is enabled
	if (shouldEnableCustomModeCreation) {
		modesContent += `

- 自定义模式可以通过两种方式配置:
  1. 全局通过 '${customModesPath}' (启动时自动创建)
  2. 每个工作区通过工作区根目录中的 '.roomodes' 文件

  当具有相同slug的模式同时存在于两个文件中时，工作区特定的.roomodes版本优先。这允许项目覆盖全局模式或定义项目特定的模式。

  如果被要求创建项目模式，请在工作区根目录中的.roomodes中创建。如果被要求创建全局模式，请使用全局自定义模式文件。

- 以下字段是必需的且不能为空:
  * slug: 有效的标识符(小写字母、数字和连字符)。必须唯一，且越短越好。
  * name: 模式的显示名称
  * roleDefinition: 关于模式角色和能力的详细描述
  * groups: 允许的工具组数组(可以为空)。每个组可以指定为字符串(例如,"edit"允许编辑任何文件)或带有文件限制(例如,["edit", { fileRegex: "\\.md$", description: "仅限Markdown文件" }]仅允许编辑markdown文件)

- customInstructions字段是可选的。

- 对于多行文本，在字符串中包含换行字符，如"这是第一行。\\n这是下一行。\\n\\n这是双行换行。"

两个文件都应遵循此结构:
{
 "customModes": [
   {
     "slug": "designer", // 必需: 唯一的小写字母、数字和连字符标识符
     "name": "Designer", // 必需: 模式显示名称
     "roleDefinition": "你是Magic，一个专注于设计系统和前端开发的UI/UX专家。你的专长包括:\\n- 创建和维护设计系统\\n- 实现响应式和可访问的Web界面\\n- 使用CSS、HTML和现代前端框架\\n- 确保跨平台的一致用户体验", // 必需: 非空
     "groups": [ // 必需: 工具组数组(可以为空)
       "read",    // 读取文件组(read_file, search_files, list_files, list_code_definition_names)
       "edit",    // 编辑文件组(apply_diff, write_to_file) - 允许编辑任何文件
       // 或者带有文件限制:
       // ["edit", { fileRegex: "\\.md$", description: "仅限Markdown文件" }],  // 只允许编辑markdown文件的编辑组
       "browser", // 浏览器组(browser_action)
       "command", // 命令组(execute_command)
       "mcp"     // MCP组(use_mcp_tool, access_mcp_resource)
     ],
     "customInstructions": "Designer模式的附加说明" // 可选
    }
  ]
}`
	}

	return modesContent
}
