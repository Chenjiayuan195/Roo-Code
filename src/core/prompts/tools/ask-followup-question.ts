export function getAskFollowupQuestionDescription(): string {
	return `## ask_followup_question

描述：向用户提问以收集完成任务所需的额外信息。当您遇到模糊之处、需要澄清或需要更多细节以有效推进时，应使用此工具。通过实现与用户的直接沟通，它允许进行交互式问题解决。请明智地使用此工具，在收集必要信息和避免过多来回交流之间保持平衡。
参数：
- question: (必需) 要向用户提出的问题。这应该是一个清晰、具体的问题，针对您需要的信息。
- follow_up: (必需) 2-4个从问题逻辑推导出的建议答案列表，按优先级或逻辑顺序排列。每个建议必须：
  1. 在自己的<suggest>标签中提供
  2. 具体、可行，并与已完成的任务直接相关
  3. 是对问题的完整回答 - 用户不应需要提供额外信息或填补任何缺失的细节。不要包含带有方括号或括号的占位符。
用法：
<ask_followup_question>
<question>您的问题</question>
<follow_up>
<suggest>
您的建议答案
</suggest>
</follow_up>
</ask_followup_question>

示例：请求询问用户frontend-config.json文件的路径
<ask_followup_question>
<question>What is the path to the frontend-config.json file?</question>
<follow_up>
<suggest>./src/frontend-config.json</suggest>
<suggest>./config/frontend-config.json</suggest>
<suggest>./frontend-config.json</suggest>
</follow_up>
</ask_followup_question>`
}
