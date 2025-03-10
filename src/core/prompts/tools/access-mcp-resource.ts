import { ToolArgs } from "./types"

export function getAccessMcpResourceDescription(args: ToolArgs): string | undefined {
	if (!args.mcpHub) {
		return undefined
	}
	return `## access_mcp_resource
描述: 请求访问由已连接的 MCP 服务器提供的资源。资源代表可用作上下文的数据源，例如文件、API 响应或系统信息。
参数:
- server_name: (必填) 提供资源的 MCP 服务器名称
- uri: (必填) 标识要访问的特定资源的 URI
用法:
<access_mcp_resource>
<server_name>服务器名称</server_name>
<uri>资源 URI</uri>
</access_mcp_resource>

示例: 请求访问 MCP 资源

<access_mcp_resource>
<server_name>weather-server</server_name>
<uri>weather://san-francisco/current</uri>
</access_mcp_resource>`
}
