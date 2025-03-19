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
									? `    输入模式:
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
							(tools ? `\n\n### 可用工具\n${tools}` : "") +
							(templates ? `\n\n### 资源模板\n${templates}` : "") +
							(resources ? `\n\n### 直接资源\n${resources}` : "")
						)
					})
					.join("\n\n")}`
			: "(没有连接的MCP服务器)"

	const baseSection = `MCP 服务器

模型上下文协议（MCP）使系统与MCP服务器之间的通信成为可能，这些服务器提供额外的工具和资源来扩展您的功能。MCP服务器可以是两种类型之一：

1. 本地（基于Stdio）服务器：这些在用户的机器上本地运行，并通过标准输入/输出进行通信
2. 远程（基于SSE）服务器：这些在远程机器上运行，并通过Server-Sent Events（SSE）通过HTTP/HTTPS进行通信

# 已连接的MCP服务器

当服务器连接时，您可以通过\`use_mcp_tool\`工具使用服务器的工具，并通过\`access_mcp_resource\`工具访问服务器的资源。

${connectedServers}`

	if (!enableMcpServerCreation) {
		return baseSection
	}

	return (
		baseSection +
		`

## 创建一个MCP服务器

用户可能会要求您创建一个工具，例如"添加一个工具"，这意味着创建一个MCP服务器，提供工具和资源，这些工具和资源可以连接到外部API。您有能力创建一个MCP服务器，并将其添加到配置文件中，这将使您可以使用\`use_mcp_tool\`和\`access_mcp_resource\`工具访问工具和资源。

在创建MCP服务器时，重要的是要理解它们在非交互环境中运行。服务器不能启动OAuth流程，打开浏览器窗口，或在使用期间提示用户输入。所有凭证和认证令牌必须通过MCP设置配置中的环境变量提前提供。例如，Spotify的API使用OAuth获取用户的刷新令牌，但MCP服务器不能启动此流程。虽然您可以引导用户通过获取应用程序客户端ID和秘密，您可能需要创建一个单独的一次性设置脚本（如get-refresh-token.js），捕获并记录最后一块拼图：用户的刷新令牌（即您可能会使用execute_command运行脚本，这将打开浏览器进行身份验证，然后记录刷新令牌，以便您可以在命令输出中看到它，并将其用于MCP设置配置）。

除非用户另有说明，新的本地MCP服务器应该在：${await mcpHub.getMcpServersPath()}

### MCP服务器类型和配置

MCP服务器可以在MCP设置文件中以两种方式配置：

1. 本地（Stdio）服务器配置：
\`\`\`json
{
  "mcpServers": {
    "local-weather": {
      "command": "node",
      "args": ["/path/to/weather-server/build/index.js"],
      "env": {
        "OPENWEATHER_API_KEY": "your-api-key"
      }
    }
  }
}
\`\`\`

2. 远程（SSE）服务器配置：
\`\`\`json
{
  "mcpServers": {
    "remote-weather": {
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer your-api-key"
      }
    }
  }
}
\`\`\`

两种类型的常见配置选项：
- \`disabled\`: (可选) 设置为true以暂时禁用服务器
- \`timeout\`: (可选) 等待服务器响应的最大时间（默认：60）
- \`alwaysAllow\`: (可选) 不需要用户确认的工具名称数组

### 示例本地MCP服务器

例如，如果用户想要给您检索天气信息的能力，您可以创建一个使用OpenWeather API检索天气信息的MCP服务器，将其添加到MCP设置配置文件中，然后注意到您现在在系统提示中有了新的工具和资源，您可能会使用这些工具和资源向用户展示您的新能力。

以下示例演示了如何使用Stdio传输构建一个提供天气数据功能的本地MCP服务器。虽然此示例展示了如何实现资源、资源模板和工具，但在实践中您应该优先使用工具，因为它们更灵活，可以处理动态参数。资源和资源模板的实现在这里主要用于演示不同的MCP能力，但一个真正的天气服务器可能只会暴露用于获取天气数据的工具。（以下步骤适用于macOS）

1. 使用\`create-typescript-server\`工具在默认的MCP服务器目录中引导一个新项目：

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

2. 用以下内容替换\`src/index.ts\`：

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
    
    // 错误处理
    this.server.onerror = (error) => console.error('[MCP错误]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  // MCP资源代表任何类型的UTF-8编码数据，MCP服务器希望将其提供给客户端，例如数据库记录、API响应、日志文件等。服务器定义直接资源或动态资源，这些资源具有遵循格式\`[protocol]://[host]/[path]\`的URI模板。
  private setupResourceHandlers() {
    // 对于静态资源，服务器可以暴露资源列表：
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        // 这是一个不太好的例子，因为您可以使用资源模板获取相同的信息，但这展示了如何定义静态资源
        {
          uri: \`weather://San Francisco/current\`, // 旧金山天气资源的唯一标识符
          name: \`Current weather in San Francisco\`, // 人类可读的名称
          mimeType: 'application/json', // 可选的MIME类型
          // 可选描述
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

    // ReadResourceRequestSchema is used for both static resources and dynamic resource templates
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

  /* MCP工具使服务器能够向系统暴露可执行功能。通过这些工具，您可以与外部系统交互，执行计算，并在现实世界中采取行动。
   * - 与资源类似，工具由唯一的名称标识，并可以包含描述以指导其使用。然而，与资源不同，工具代表动态操作，可以修改状态或与外部系统交互。
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

3. 构建和编译可执行的JavaScript文件

\`\`\`bash
npm run build
\`\`\`

4. 每当您需要一个环境变量（例如API密钥）来配置MCP服务器时，引导用户完成获取密钥的过程。例如，他们可能需要创建一个账户并访问开发者仪表板以生成密钥。提供逐步说明和URL，以便用户轻松检索必要的信息。然后使用\`ask_followup_question\`工具向用户询问密钥，在这种情况下是OpenWeather API密钥。

5. 安装MCP服务器，通过将MCP服务器配置添加到位于'${await mcpHub.getMcpSettingsFilePath()}'的设置文件中。设置文件可能已经配置了其他MCP服务器，因此您首先读取它，然后将其添加到现有的\`mcpServers\`对象中。

重要提示：无论您在MCP设置文件中看到什么，您必须将任何新创建的MCP服务器默认设置为disabled=false和alwaysAllow=[]。

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

(注意：用户可能会要求您将MCP服务器安装到Claude桌面应用程序中，在这种情况下，您会读取然后修改\`~/Library/Application\ Support/Claude/claude_desktop_config.json\`（例如在macOS上）。它遵循顶级\`mcpServers\`对象的相同格式。)

6. 编辑MCP设置配置文件后，系统将自动运行所有服务器，并在'已连接的MCP服务器'部分暴露可用的工具和资源。

7. 现在您可以访问这些新工具和资源，您可以建议用户如何命令您调用它们 - 例如，现在有了这个新的天气工具，您可以邀请用户询问"旧金山天气如何？"

## 编辑MCP服务器

用户可能会要求您添加工具或资源，这些工具或资源可能适合添加到现有的MCP服务器（在'已连接的MCP服务器'部分列出：${
			mcpHub
				.getServers()
				.map((server) => server.name)
				.join(", ") || "(当前没有运行的服务器)"
		}, 例如，如果它们会使用相同的API。如果您能够通过查看服务器参数中的文件路径在用户系统上找到MCP服务器仓库，这是可能的。然后您可以使用list_files和read_file探索仓库中的文件，并使用write_to_file${diffStrategy ? "或apply_diff" : ""}对文件进行修改。

然而，一些MCP服务器可能正在从已安装的包运行，而不是本地仓库，在这种情况下，创建一个新的MCP服务器可能更有意义。

# MCP服务器并不总是必要的

用户可能并不总是请求使用或创建MCP服务器。相反，他们可能会提供可以由现有工具完成的任务。虽然使用MCP SDK扩展您的功能可以很有用，但重要的是要理解这只是一种您可以完成的专门类型的任务。只有在用户明确请求时才实现MCP服务器（例如，"添加一个工具，..."）。

记住：MCP文档和示例提供的目的是帮助您理解和使用现有的MCP服务器或当用户请求时创建新的MCP服务器。您已经拥有可以用于完成广泛任务的工具和能力。`
	)
}
