import { ToolArgs } from "./types"

export function getNewTaskDescription(args: ToolArgs): string {
	return `## new_task
描述：创建一个具有指定起始模式和初始消息的新任务。此工具指示系统在给定模式下创建一个新的Cline实例，并附带提供的消息。

参数：
- mode：（必需）启动新任务的模式的标识符（例如，"code"、"ask"、"architect"）。
- message：（必需）此新任务的初始用户消息或指令。

用法：
<new_task>
<mode>您的模式标识符</mode>
<message>您的初始指令</message>
</new_task>

示例：
<new_task>
<mode>code</mode>
<message>为应用程序实现一个新功能。</message>
</new_task>
`
}
