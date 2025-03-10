import { DiffStrategy } from "../../diff/DiffStrategy"
import { McpHub } from "../../../services/mcp/McpHub"

export async function getMcpServersSection(
	mcpHub?: McpHub,
	diffStrategy?: DiffStrategy,
	enableMcpServerCreation?: boolean,
): Promise<string> {
	if (!mcpHub) {
		return ""
	}

	const connectedServers =
		mcpHub.getServers().length > 0
			? `${mcpHub
					.getServers()
					.filter((server) => server.status === "connected")
					.map((server) => {
						const tools = server.tools
							?.map((tool) => {
								const schemaStr = tool.inputSchema
									? `    Input Schema:
    ${JSON.stringify(tool.inputSchema, null, 2).split("\n").join("\n    ")}`
									: ""

								return `- ${tool.name}: ${tool.description}\n${schemaStr}`
							})
							.join("\n\n")

						const templates = server.resourceTemplates
							?.map((template) => `- ${template.uriTemplate} (${template.name}): ${template.description}`)
							.join("\n")

						const resources = server.resources
							?.map((resource) => `- ${resource.uri} (${resource.name}): ${resource.description}`)
							.join("\n")

						const config = JSON.parse(server.config)

						return (
							`## ${server.name} (\`${config.command}${config.args && Array.isArray(config.args) ? ` ${config.args.join(" ")}` : ""}\`)` +
							(tools ? `\n\n### Available Tools\n${tools}` : "") +
							(templates ? `\n\n### Resource Templates\n${templates}` : "") +
							(resources ? `\n\n### Direct Resources\n${resources}` : "")
						)
					})
					.join("\n\n")}`
			: "(No MCP servers currently connected)"

	const baseSection = `MCP 服务器

模型上下文协议 (MCP) 实现了系统与本地运行的 MCP 服务器之间的通信，这些服务器提供额外的工具和资源来扩展您的能力。

# 已连接的 MCP 服务器

当服务器连接后，您可以通过 \`use_mcp_tool\` 工具使用服务器的工具，并通过 \`access_mcp_resource\` 工具访问服务器的资源。

${connectedServers}`

	if (!enableMcpServerCreation) {
		return baseSection
	}

	return (
		baseSection +
		`

## 创建 MCP 服务器

用户可能会要求您"添加一个工具"来执行某些功能，换句话说，创建一个 MCP 服务器，提供可能连接到外部 API 的工具和资源。您有能力创建 MCP 服务器并将其添加到配置文件中，然后您就可以使用 \`use_mcp_tool\` 和 \`access_mcp_resource\` 来使用这些工具和资源。

创建 MCP 服务器时，重要的是要理解它们在非交互式环境中运行。服务器不能启动 OAuth 流程、打开浏览器窗口或在运行时提示用户输入。所有凭据和认证令牌必须通过 MCP 设置配置中的环境变量预先提供。例如，Spotify 的 API 使用 OAuth 获取用户的刷新令牌，但 MCP 服务器无法启动此流程。虽然您可以指导用户获取应用程序客户端 ID 和密钥，但您可能必须创建一个一次性设置脚本（如 get-refresh-token.js），该脚本捕获并记录最后一部分：用户的刷新令牌（即您可能使用 execute_command 运行脚本，该脚本会打开浏览器进行身份验证，然后记录刷新令牌，以便您可以在命令输出中看到它，并在 MCP 设置配置中使用）。

除非用户另有指定，否则新的 MCP 服务器应创建在: ${await mcpHub.getMcpServersPath()}

### MCP 服务器示例

例如，如果用户想让您能够检索天气信息，您可以创建一个使用 OpenWeather API 获取天气信息的 MCP 服务器，将其添加到 MCP 设置配置文件中，然后注意到您现在可以在系统提示中访问新的工具和资源，您可以使用这些工具向用户展示您的新功能。

以下示例演示如何构建提供天气数据功能的 MCP 服务器。虽然此示例展示了如何实现资源、资源模板和工具，但实际上您应该优先使用工具，因为它们更灵活，可以处理动态参数。资源和资源模板实现主要是为了演示不同的 MCP 功能而包含在这里，但实际的天气服务器可能只会公开用于获取天气数据的工具。（以下步骤适用于 macOS）

1. 使用 \`create-typescript-server\` 工具在默认 MCP 服务器目录中引导新项目：

\`\`\`bash
cd ${await mcpHub.getMcpServersPath()}
npx @modelcontextprotocol/create-server weather-server
cd weather-server
# 安装依赖
npm install axios
\`\`\`

这将创建一个具有以下结构的新项目：

\`\`\`
weather-server/
  ├── package.json
      {
        ...
        "type": "module", // added by default, uses ES module syntax (import/export) rather than CommonJS (require/module.exports) (Important to know if you create additional scripts in this server repository like a get-refresh-token.js script)
        "scripts": {
          "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
          ...
        }
        ...
      }
  ├── tsconfig.json
  └── src/
      └── weather-server/
          └── index.ts      # Main server implementation
\`\`\`

2. 用以下内容替换 \`src/index.ts\`：

\`\`\`typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY; // provided by MCP config
if (!API_KEY) {
  throw new Error('OPENWEATHER_API_KEY environment variable is required');
}

interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: [{ description: string }];
  wind: { speed: number };
  dt_txt?: string;
}

const isValidForecastArgs = (
  args: any
): args is { city: string; days?: number } =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.city === 'string' &&
  (args.days === undefined || typeof args.days === 'number');

class WeatherServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'example-weather-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'http://api.openweathermap.org/data/2.5',
      params: {
        appid: API_KEY,
        units: 'metric',
      },
    });

    this.setupResourceHandlers();
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  // MCP Resources represent any kind of UTF-8 encoded data that an MCP server wants to make available to clients, such as database records, API responses, log files, and more. Servers define direct resources with a static URI or dynamic resources with a URI template that follows the format \`[protocol]://[host]/[path]\`.
  private setupResourceHandlers() {
    // For static resources, servers can expose a list of resources:
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        // This is a poor example since you could use the resource template to get the same information but this demonstrates how to define a static resource
        {
          uri: \`weather://San Francisco/current\`, // Unique identifier for San Francisco weather resource
          name: \`Current weather in San Francisco\`, // Human-readable name
          mimeType: 'application/json', // Optional MIME type
          // Optional description
          description:
            'Real-time weather data for San Francisco including temperature, conditions, humidity, and wind speed',
        },
      ],
    }));

    // For dynamic resources, servers can expose resource templates:
    this.server.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async () => ({
        resourceTemplates: [
          {
            uriTemplate: 'weather://{city}/current', // URI template (RFC 6570)
            name: 'Current weather for a given city', // Human-readable name
            mimeType: 'application/json', // Optional MIME type
            description: 'Real-time weather data for a specified city', // Optional description
          },
        ],
      })
    );

    // ReadResourceRequestSchema 用于静态资源和动态资源模板
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const match = request.params.uri.match(
          /^weather:\/\/([^/]+)\/current$/
        );
        if (!match) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            \`Invalid URI format: \${request.params.uri}\`
          );
        }
        const city = decodeURIComponent(match[1]);

        try {
          const response = await this.axiosInstance.get(
            'weather', // current weather
            {
              params: { q: city },
            }
          );

          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    temperature: response.data.main.temp,
                    conditions: response.data.weather[0].description,
                    humidity: response.data.main.humidity,
                    wind_speed: response.data.wind.speed,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new McpError(
              ErrorCode.InternalError,
              \`Weather API error: \${
                error.response?.data.message ?? error.message
              }\`
            );
          }
          throw error;
        }
      }
    );
  }

  /* MCP 工具使服务器能够向系统公开可执行的功能。通过这些工具，您可以与外部系统交互、执行计算并采取现实世界的行动。
   * - 与资源类似，工具由唯一的名称标识，可以包含描述来指导其使用。然而，与资源不同，工具代表动态操作，可以修改状态或与外部系统交互。
   * - 虽然资源和工具相似，但您应该优先创建工具而不是资源，因为它们提供更大的灵活性。
   */
  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_forecast', // Unique identifier
          description: 'Get weather forecast for a city', // Human-readable description
          inputSchema: {
            // JSON Schema for parameters
            type: 'object',
            properties: {
              city: {
                type: 'string',
                description: 'City name',
              },
              days: {
                type: 'number',
                description: 'Number of days (1-5)',
                minimum: 1,
                maximum: 5,
              },
            },
            required: ['city'], // Array of required property names
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'get_forecast') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          \`Unknown tool: \${request.params.name}\`
        );
      }

      if (!isValidForecastArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid forecast arguments'
        );
      }

      const city = request.params.arguments.city;
      const days = Math.min(request.params.arguments.days || 3, 5);

      try {
        const response = await this.axiosInstance.get<{
          list: OpenWeatherResponse[];
        }>('forecast', {
          params: {
            q: city,
            cnt: days * 8,
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data.list, null, 2),
            },
          ],
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [
              {
                type: 'text',
                text: \`Weather API error: \${
                  error.response?.data.message ?? error.message
                }\`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Weather MCP server running on stdio');
  }
}

const server = new WeatherServer();
server.run().catch(console.error);
\`\`\`

(记住：这只是示例–您可以使用不同的依赖项，将实现分解为多个文件等。)

3. 构建和编译可执行的 JavaScript 文件

\`\`\`bash
npm run build
\`\`\`

4. 每当您需要环境变量（例如 API 密钥）来配置 MCP 服务器时，引导用户完成获取密钥的过程。例如，他们可能需要创建一个帐户并访问开发人员仪表板以生成密钥。提供逐步说明和 URL 以方便用户检索必要的信息。然后使用 ask_followup_question 工具向用户询问密钥，在这种情况下是 OpenWeather API 密钥。

5. 安装 MCP 服务器，通过将 MCP 服务器配置添加到位于 '${await mcpHub.getMcpSettingsFilePath()}' 的设置文件中。设置文件可能已经配置了其他 MCP 服务器，因此您需要先读取它，然后将其添加到现有的 \`mcpServers\` 对象中。

重要提示: 无论 MCP 设置文件中看到什么, 您必须将任何新创建的 MCP 服务器默认设置为 disabled=false 和 alwaysAllow=[]。

\`\`\`json
{
  "mcpServers": {
    ...,
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-server/build/index.js"],
      "env": {
        "OPENWEATHER_API_KEY": "user-provided-api-key"
      }
    },
  }
}
\`\`\`

(提示: 用户可能会要求您将 MCP 服务器安装到 Claude 桌面应用程序中，在这种情况下，您需要读取并修改 \`~/Library/Application\ Support/Claude/claude_desktop_config.json\` 在 macOS 上，例如。它遵循顶级 \`mcpServers\` 对象的格式。)

6. 编辑 MCP 设置配置文件后，系统将自动运行所有服务器并公开可用工具和资源，在 'Connected MCP Servers' 部分。

7. 现在您可以访问这些新工具和资源，您可以邀请用户询问 "旧金山天气如何？"

## 编辑 MCP 服务器

用户可能会要求您添加工具或资源，这些工具或资源可能适合添加到现有的 MCP 服务器中（在 'Connected MCP Servers' 部分列出：${
			mcpHub
				.getServers()
				.map((server) => server.name)
				.join(", ") || "(None running currently)"
		}, 例如，如果它使用相同的 API，则可以将其添加到现有的 MCP 服务器中。如果可以定位 MCP 服务器存储库，则可以通过查看服务器参数来定位它。然后，您可以使用 list_files 和 read_file 探索存储库中的文件，并使用 write_to_file${diffStrategy ? " 或 apply_diff" : ""} 进行更改。

然而，一些 MCP 服务器可能正在从已安装的包运行，而不是本地存储库，在这种情况下，创建一个新的 MCP 服务器可能更有意义。

# MCP 服务器不是总是必要的

用户可能不会总是请求使用或创建 MCP 服务器。相反，他们可能会提供可以与现有工具完成的工作。虽然使用 MCP SDK 扩展您的功能可能很有用，但重要的是要理解这只是一种您可以完成的专门类型的任务。您应该只在用户明确请求时实现 MCP 服务器（例如，"添加一个工具..."）。

记住：MCP 文档和上述示例是为了帮助您理解和使用现有的 MCP 服务器或当用户请求时创建新的 MCP 服务器。您已经拥有可以用来完成广泛任务的工具和能力。`
	)
}
