import { ToolArgs } from "./types"

export function getReadFileDescription(args: ToolArgs): string {
	return `## read_file
Description: 请求读取指定路径的文件内容。当您需要检查一个您不知道内容的不存在文件时，请使用此工具。例如，分析代码、审查文本文件或提取配置文件中的信息。输出包括每行前缀的行号（例如“1 | const x = 1”），使您更容易在创建差异或讨论代码时引用特定行。自动提取PDF和DOCX文件的原始文本。可能不适用于其他类型的二进制文件，因为它返回原始内容作为字符串。
Parameters:
- path: (required) 要读取的文件的路径（相对于当前工作目录 ${args.cwd})
Usage:
<read_file>
<path>文件路径</path>
</read_file>

Example: 请求读取frontend-config.json
<read_file>
<path>frontend-config.json</path>
</read_file>`
}
