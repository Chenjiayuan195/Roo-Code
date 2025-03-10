import { ToolArgs } from "./types"

export function getExecuteCommandDescription(args: ToolArgs): string | undefined {
	return `## execute_command
描述: 请求在系统上执行 CLI 命令。当您需要执行系统操作或运行特定命令以完成用户任务中的任何步骤时，使用此功能。您必须根据用户的系统调整命令，并提供关于该命令功能的清晰解释。对于命令链接，请使用适合用户 shell 的链接语法。优先执行复杂的 CLI 命令而不是创建可执行脚本，因为它们更灵活、更容易运行。命令将在当前工作目录中执行: ${args.cwd}
参数:
- command: (必填) 要执行的 CLI 命令。这应该对当前操作系统有效。确保命令格式正确，不包含任何有害指令。
用法:
<execute_command>
<command>在此输入您的命令</command>
</execute_command>

示例: 请求执行 npm run dev
<execute_command>
<command>npm run dev</command>
</execute_command>`
}
