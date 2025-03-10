import { ToolArgs } from "./types"

export function getNewTaskDescription(args: ToolArgs): string {
	return `## new_task
描述: 使用指定的起始模式和初始消息创建新任务。此工具指示系统在给定模式下创建具有提供的消息的新 Cline 实例。

参数:
- mode: (必填) 开始新任务的模式的 slug（例如，"code"、"ask"、"architect"）。
- message: (必填) 此新任务的初始用户消息或指令。

用法:
<new_task>
<mode>您的模式-slug</mode>
<message>您的初始指令</message>
</new_task>

示例:
<new_task>
<mode>code</mode>
<message>为应用程序实现新功能。</message>
</new_task>
`
}
