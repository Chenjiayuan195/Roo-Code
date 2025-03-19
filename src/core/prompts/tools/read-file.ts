import { ToolArgs } from "./types"

export function getReadFileDescription(args: ToolArgs): string {
	return `## read_file
描述：请求读取指定路径的文件内容。当您需要检查您不知道内容的现有文件时使用此工具，例如分析代码、查看文本文件或从配置文件中提取信息。输出包括每行前缀的行号（例如"1 | const x = 1"），使得在创建差异或讨论代码时引用特定行更容易。自动从PDF和DOCX文件中提取原始文本。可能不适用于其他类型的二进制文件，因为它将原始内容作为字符串返回。
参数：
- path：（必需）要读取的文件路径（相对于当前工作目录${args.cwd}）
用法：
<read_file>
<path>文件路径</path>
</read_file>

示例：请求读取frontend-config.json
<read_file>
<path>frontend-config.json</path>
</read_file>`
}
