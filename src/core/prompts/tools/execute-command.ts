import { ToolArgs } from "./types"

export function getExecuteCommandDescription(args: ToolArgs): string | undefined {
	return `## execute_command
描述：请求在系统上执行CLI命令。当您需要执行系统操作或运行特定命令来完成用户任务中的任何步骤时使用此功能。您必须根据用户的系统调整命令，并提供关于命令功能的清晰解释。对于命令链接，请使用适合用户shell的链接语法。相比创建可执行脚本，优先执行复杂的CLI命令，因为它们更灵活且更容易运行。优先使用相对命令和路径，避免位置敏感性以保持终端一致性，例如：\`touch ./testdata/example.file\`、\`dir ./examples/model1/data/yaml\`或\`go test ./cmd/front --config ./cmd/front/config.yml\`。如果用户指示，您可以使用\`cwd\`参数在不同的目录中打开终端。
参数：
- command：（必需）要执行的CLI命令。这应该对当前操作系统有效。确保命令格式正确且不包含任何有害指令。
- cwd：（可选）执行命令的工作目录（默认：${args.cwd}）
用法：
<execute_command>
<command>您的命令</command>
<cwd>工作目录路径（可选）</cwd>
</execute_command>

示例：请求执行npm run dev
<execute_command>
<command>npm run dev</command>
</execute_command>

示例：如果有指示，请求在特定目录中执行ls
<execute_command>
<command>ls -la</command>
<cwd>/home/user/projects</cwd>
</execute_command>`
}
