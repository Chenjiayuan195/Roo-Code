import { ToolArgs } from "./types"

export function getListFilesDescription(args: ToolArgs): string {
	return `## list_files
描述: 请求列出指定目录中的文件和目录。如果 recursive 为 true，它将递归列出所有文件和目录。如果 recursive 为 false 或未提供，它将只列出顶层内容。不要使用此工具来确认您可能创建的文件是否存在，因为用户会告诉您文件是否成功创建。
参数:
- path: (必填) 要列出内容的目录路径（相对于当前工作目录 ${args.cwd}）
- recursive: (可选) 是否递归列出文件。使用 true 进行递归列出，false 或省略仅列出顶层。
用法:
<list_files>
<path>目录路径</path>
<recursive>true 或 false（可选）</recursive>
</list_files>

示例: 请求列出当前目录中的所有文件
<list_files>
<path>.</path>
<recursive>false</recursive>
</list_files>`
}
