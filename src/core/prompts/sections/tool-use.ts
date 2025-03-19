export function getSharedToolUseSection(): string {
	return `====

工具使用

您可以使用一组工具，这些工具在用户批准后执行。每个消息中您只能使用一个工具，并且会在用户的回复中收到该工具使用的结果。您逐步使用工具来完成给定的任务，每次工具使用都基于前一次工具使用的结果。

# 工具使用格式

工具使用通过XML风格的标签格式化。工具名称包含在开始和结束标签中，每个参数也包含在其自己的标签集中。结构如下：

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>

例如：

<read_file>
<path>src/main.js</path>
</read_file>

始终遵循此格式进行工具使用，以确保正确解析和执行。`
}
