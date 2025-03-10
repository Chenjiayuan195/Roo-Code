export function getAskFollowupQuestionDescription(): string {
	return `## ask_followup_question
描述: 向用户提问以收集完成任务所需的额外信息。当您遇到歧义、需要澄清或需要更多细节才能有效继续时，应使用此工具。它通过实现与用户的直接沟通，允许进行交互式问题解决。请明智地使用此工具，以在收集必要信息和避免过多来回交流之间保持平衡。
参数:
- question: (必填) 要向用户提出的问题。这应该是一个明确、具体的问题，能够解决您需要的信息。
用法:
<ask_followup_question>
<question>在此输入您的问题</question>
</ask_followup_question>

示例: 请求询问用户 frontend-config.json 文件的路径
<ask_followup_question>
<question>frontend-config.json 文件的路径是什么？</question>
</ask_followup_question>`
}
