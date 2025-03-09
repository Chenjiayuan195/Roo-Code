export function getSharedToolUseSection(): string {
	return `====

工具使用

您可以访问一组工具，这些工具在用户批准后执行。您可以在每条消息中使用一个工具，并将在用户响应中收到该工具使用的结果。您逐步使用工具来完成给定的任务，每个工具使用都受到前一个工具使用结果的影响。

# 工具使用格式

工具使用使用XML风格的标签格式。工具名称用一对开始和结束标签包围，每个参数用一对开始和结束标签包围。以下是结构：

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>

例如：

<read_file>
<path>src/main.js</path>
</read_file>

始终遵循此格式以确保正确解析和执行。`
}
