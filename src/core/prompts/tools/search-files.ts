import { ToolArgs } from "./types"

export function getSearchFilesDescription(args: ToolArgs): string {
	return `## search_files
描述: 请求在指定目录中执行正则表达式搜索，提供丰富的上下文结果。此工具在多个文件中搜索模式或特定内容，显示每个匹配项及其上下文。
参数:
- path: (required) 要搜索的目录的路径（相对于当前工作目录 ${args.cwd}). 此目录将递归搜索。
- regex: (required) 要搜索的正则表达式模式。使用Rust正则表达式语法。
- file_pattern: (optional) 文件过滤模式（例如，'*.ts'用于TypeScript文件）。如果未提供，它将搜索所有文件（*）。
使用:
<search_files>
<path>目录路径</path>
<regex>您的正则表达式模式</regex>
<file_pattern>文件模式（可选）</file_pattern>
</search_files>

示例: 请求在当前目录中搜索所有.ts文件
<search_files>
<path>.</path>
<regex>.*</regex>
<file_pattern>*.ts</file_pattern>
</search_files>`
}
