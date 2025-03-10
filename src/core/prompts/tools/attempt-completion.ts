export function getAttemptCompletionDescription(): string {
	return `## attempt_completion
描述: 每次工具使用后，用户将回应该工具使用的结果，即它是成功还是失败，以及失败的任何原因。一旦您收到工具使用的结果并确认任务已完成，使用此工具向用户展示您工作的结果。您可以选择提供 CLI 命令来展示您工作的结果。如果用户对结果不满意，他们可能会提供反馈，您可以使用这些反馈进行改进并再次尝试。
重要说明：在您从用户确认任何先前的工具使用成功之前，不能使用此工具。否则将导致代码损坏和系统故障。在使用此工具之前，您必须在 <thinking></thinking> 标签中问自己是否已从用户那里确认任何先前的工具使用成功。如果没有，那么不要使用此工具。
参数:
- result: (必填) 任务的结果。以最终方式制定此结果，不需要用户进一步的输入。不要以问题或提供进一步帮助的方式结束您的结果。
- command: (可选) 执行 CLI 命令向用户展示结果的实时演示。例如，使用 \`open index.html\` 显示创建的 html 网站，或 \`open localhost:3000\` 显示本地运行的开发服务器。但不要使用仅打印文本的命令，如 \`echo\` 或 \`cat\`。此命令应对当前操作系统有效。确保命令格式正确，不包含任何有害指令。
用法:
<attempt_completion>
<r>
在此输入您的最终结果描述
</r>
<command>演示结果的命令（可选）</command>
</attempt_completion>

示例: 请求尝试完成，包括结果和命令
<attempt_completion>
<r>
我已更新 CSS
</r>
<command>open index.html</command>
</attempt_completion>`
}
