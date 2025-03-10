import { ToolArgs } from "./types"

export function getWriteToFileDescription(args: ToolArgs): string {
	return `## write_to_file
描述: 请求向指定路径的文件写入完整内容。如果文件已存在，它将被提供的内容覆盖。如果文件不存在，将创建该文件。此工具将自动创建写入文件所需的任何目录。
参数:
- path: (必填) 要写入的文件路径（相对于当前工作目录 ${args.cwd}）
- content: (必填) 要写入文件的内容。始终提供文件的完整预期内容，不要有任何截断或省略。您必须包含文件的所有部分，即使它们没有被修改。但不要在内容中包含行号，只包含文件的实际内容。
- line_count: (必填) 文件中的行数。确保根据文件的实际内容计算这个数字，而不是您提供的内容中的行数。
用法:
<write_to_file>
<path>文件路径</path>
<content>
您的文件内容
</content>
<line_count>文件中的总行数，包括空行</line_count>
</write_to_file>

示例: 请求写入 frontend-config.json
<write_to_file>
<path>frontend-config.json</path>
<content>
{
  "apiEndpoint": "https://api.example.com",
  "theme": {
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    "fontFamily": "Arial, sans-serif"
  },
  "features": {
    "darkMode": true,
    "notifications": true,
    "analytics": false
  },
  "version": "1.0.0"
}
</content>
<line_count>14</line_count>
</write_to_file>`
}
