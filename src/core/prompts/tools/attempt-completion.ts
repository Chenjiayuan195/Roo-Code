export function getAttemptCompletionDescription(): string {
	return `## attempt_completion
描述：在每次工具使用后，用户将回复该工具使用的结果，即成功或失败，以及任何失败原因。一旦您收到工具使用的结果并确认任务已完成，使用此工具向用户展示您工作的结果。您可以选择提供CLI命令来展示您工作的结果。如果用户对结果不满意，他们可能会回复反馈，您可以使用这些反馈进行改进并再次尝试。
重要提示：在确认用户已确认之前的任何工具使用都成功之前，不能使用此工具。否则将导致代码损坏和系统故障。在使用此工具之前，您必须在<thinking></thinking>标签中问自己是否已从用户那里确认任何先前的工具使用都已成功。如果没有，则不要使用此工具。
参数：
- result：（必需）任务的结果。以终结性的方式制定此结果，不需要用户的进一步输入。不要以问题或进一步协助的提议结束您的结果。
- command：（可选）执行以向用户展示结果实时演示的CLI命令。例如，使用\`open index.html\`显示创建的html网站，或\`open localhost:3000\`显示本地运行的开发服务器。但不要使用\`echo\`或\`cat\`等仅打印文本的命令。此命令应该对当前操作系统有效。确保命令格式正确且不包含任何有害指令。
用法：
<attempt_completion>
<result>
您的最终结果描述
</result>
<command>展示结果的命令（可选）</command>
</attempt_completion>

示例：请求尝试完成，带有结果和命令
<attempt_completion>
<result>
我已更新了CSS
</result>
<command>open index.html</command>
</attempt_completion>`
}
