import { ToolArgs } from "./types"

export function getAccessMcpResourceDescription(args: ToolArgs): string | undefined {
	if (!args.mcpHub) {
		return undefined
	}
	return `## access_mcp_resource
描述：请求访问由已连接的MCP服务器提供的资源。资源代表可以作为上下文使用的数据源，例如文件、API响应或系统信息。
参数：
- server_name：（必需）提供资源的MCP服务器的名称
- uri：（必需）标识要访问的特定资源的URI
用法：
<access_mcp_resource>
<server_name>在此处输入服务器名称</server_name>
<uri>在此处输入资源URI</uri>
</access_mcp_resource>

示例：请求访问MCP资源

<access_mcp_resource>
<server_name>weather-server</server_name>
<uri>weather://san-francisco/current</uri>
</access_mcp_resource>`
}
