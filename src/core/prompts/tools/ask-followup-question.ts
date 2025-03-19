export function getAskFollowupQuestionDescription(): string {
	return `## ask_followup_question
描述：向用户提问以收集完成任务所需的额外信息。当您遇到模糊之处、需要澄清或需要更多细节以有效继续时，应该使用此工具。它通过启用与用户的直接沟通，实现交互式问题解决。谨慎使用此工具，以在收集必要信息和避免过多来回之间保持平衡。
参数：
- question：（必需）要问用户的问题。这应该是一个明确、具体的问题，针对您需要的信息。
用法：
<ask_followup_question>
<question>您的问题</question>
</ask_followup_question>

示例：请求询问用户frontend-config.json文件的路径
<ask_followup_question>
<question>frontend-config.json文件的路径是什么？</question>
</ask_followup_question>`
}
