import { ToolArgs } from "./types"

export function getBrowserActionDescription(args: ToolArgs): string | undefined {
	if (!args.supportsComputerUse) {
		return undefined
	}
	return `## browser_action
描述: 请求与 Puppeteer 控制的浏览器交互。除 \`close\` 外的每个操作都会返回浏览器当前状态的截图，以及任何新的控制台日志。您每条消息只能执行一个浏览器操作，并等待用户的响应，包括截图和日志，以确定下一步操作。
- 操作序列**必须始终以**在 URL 处启动浏览器开始，并**必须始终以**关闭浏览器结束。如果您需要访问无法从当前网页导航到的新 URL，您必须先关闭浏览器，然后在新 URL 处再次启动。
- 当浏览器处于活动状态时，只能使用 \`browser_action\` 工具。在此期间不应调用其他工具。只有在关闭浏览器后，您才能继续使用其他工具。例如，如果您遇到错误并需要修复文件，您必须关闭浏览器，然后使用其他工具进行必要的更改，然后重新启动浏览器以验证结果。
- 浏览器窗口的分辨率为 **${args.browserViewportSize}** 像素。执行任何点击操作时，请确保坐标在此分辨率范围内。
- 在点击任何元素（如图标、链接或按钮）之前，您必须查看提供的页面截图，以确定元素的坐标。点击应该针对**元素的中心**，而不是它的边缘。
参数:
- action: (必填) 要执行的操作。可用的操作有：
    * launch: 在指定 URL 处启动新的 Puppeteer 控制的浏览器实例。这**必须始终是第一个操作**。
        - 与 \`url\` 参数一起使用提供 URL。
        - 确保 URL 有效并包含适当的协议（例如 http://localhost:3000/page, file:///path/to/file.html 等）
    * click: 在特定的 x,y 坐标处点击。
        - 使用 \`coordinate\` 参数指定位置。
        - 始终根据从截图中获取的坐标点击元素（图标、按钮、链接等）的中心。
    * type: 在键盘上输入一串文本。在点击文本字段后，您可能会使用此功能输入文本。
        - 使用 \`text\` 参数提供要输入的字符串。
    * scroll_down: 向下滚动一个页面高度。
    * scroll_up: 向上滚动一个页面高度。
    * close: 关闭 Puppeteer 控制的浏览器实例。这**必须始终是最后一个浏览器操作**。
        - 示例: \`<action>close</action>\`
- url: (可选) 用于为 \`launch\` 操作提供 URL。
    * 示例: <url>https://example.com</url>
- coordinate: (可选) \`click\` 操作的 X 和 Y 坐标。坐标应在 **${args.browserViewportSize}** 分辨率范围内。
    * 示例: <coordinate>450,300</coordinate>
- text: (可选) 用于为 \`type\` 操作提供文本。
    * 示例: <text>Hello, world!</text>
用法:
<browser_action>
<action>要执行的操作（例如，launch, click, type, scroll_down, scroll_up, close）</action>
<url>启动浏览器的 URL（可选）</url>
<coordinate>x,y 坐标（可选）</coordinate>
<text>要输入的文本（可选）</text>
</browser_action>

示例: 请求在 https://example.com 启动浏览器
<browser_action>
<action>launch</action>
<url>https://example.com</url>
</browser_action>

示例: 请求点击坐标 450,300 处的元素
<browser_action>
<action>click</action>
<coordinate>450,300</coordinate>
</browser_action>`
}
