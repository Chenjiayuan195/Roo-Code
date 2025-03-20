import { ToolArgs } from "./types"

export function getReadFileDescription(args: ToolArgs): string {
	return `## read_file
Description: 请求读取指定路径的文件内容。当您需要检查您不知道内容的现有文件时使用此工具，例如分析代码、查看文本文件或从配置文件中提取信息。输出包含每行前缀的行号（例如"1 | const x = 1"），使得在创建差异或讨论代码时更容易引用特定行。通过指定 start_line 和 end_line 参数，您可以高效地读取大文件的特定部分，而无需将整个文件加载到内存中。自动从PDF和DOCX文件中提取原始文本。可能不适用于其他类型的二进制文件，因为它将原始内容作为字符串返回。
Parameters:
- path: (必填) 要读取的文件路径（相对于当前工作目录 ${args.cwd}）
- start_line: (可选) 开始读取的行号（从1开始）。如果未提供，则从文件开头开始读取。
- end_line: (可选) 结束读取的行号（从1开始，包含该行）。如果未提供，则读取到文件末尾。
Usage:
<read_file>
<path>文件路径</path>
<start_line>起始行号（可选）</start_line>
<end_line>结束行号（可选）</end_line>
</read_file>

Examples:

1. 读取整个文件:
<read_file>
<path>frontend-config.json</path>
</read_file>

2. 读取大型日志文件的前1000行:
<read_file>
<path>logs/application.log</path>
<end_line>1000</end_line>
</read_file>

3. 读取CSV文件的第500-1000行:
<read_file>
<path>data/large-dataset.csv</path>
<start_line>500</start_line>
<end_line>1000</end_line>
</read_file>

4. 读取源文件中的特定函数:
<read_file>
<path>src/app.ts</path>
<start_line>46</start_line>
<end_line>68</end_line>
</read_file>

Note: 当同时提供 start_line 和 end_line 时，此工具会高效地仅流式传输请求的行，使其适用于处理大型文件，如日志、CSV文件和其他大型数据集，而不会出现内存问题。`
}
