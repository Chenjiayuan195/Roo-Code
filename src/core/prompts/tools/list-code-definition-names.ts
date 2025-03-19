import { ToolArgs } from "./types"

export function getListCodeDefinitionNamesDescription(args: ToolArgs): string {
	return `## list_code_definition_names
描述：请求列出指定目录顶层源代码文件中使用的定义名称（类、函数、方法等）。此工具提供对代码库结构和重要构造的洞察，封装了对理解整体架构至关重要的高级概念和关系。
参数：
- path：（必需）要列出顶层源代码定义的目录路径（相对于当前工作目录${args.cwd}）。
用法：
<list_code_definition_names>
<path>目录路径</path>
</list_code_definition_names>

示例：请求列出当前目录中的所有顶层源代码定义
<list_code_definition_names>
<path>.</path>
</list_code_definition_names>`
}
