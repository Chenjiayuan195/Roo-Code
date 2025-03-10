## 对于所有设置

1. 将设置添加到 ExtensionMessage.ts：

    - 将设置添加到 ExtensionState 接口
    - 如果它有默认值，则使其成为必需的；如果它可以是 undefined，则使其成为可选的
    - 示例：`preferredLanguage: string`

2. 添加测试覆盖：
    - 在 ClineProvider.test.ts 中将设置添加到 mockState
    - 为设置持久性和状态更新添加测试用例
    - 在提交更改前确保所有测试都通过

## 对于复选框设置

1. 将消息类型添加到 WebviewMessage.ts：

    - 将设置名称添加到 WebviewMessage 类型的类型联合
    - 示例：`| "multisearchDiffEnabled"`

2. 将设置添加到 ExtensionStateContext.tsx：

    - 将设置添加到 ExtensionStateContextType 接口
    - 将设置器函数添加到接口
    - 在 useState 中将设置添加到初始状态
    - 将设置添加到 contextValue 对象
    - 示例：
        ```typescript
        interface ExtensionStateContextType {
        	multisearchDiffEnabled: boolean
        	setMultisearchDiffEnabled: (value: boolean) => void
        }
        ```

3. 将设置添加到 ClineProvider.ts：

    - 将设置名称添加到 GlobalStateKey 类型联合
    - 在 getState 的 Promise.all 数组中添加设置
    - 在 getState 的返回值中添加设置并设置默认值
    - 在 getStateToPostToWebview 中将设置添加到解构变量
    - 在 getStateToPostToWebview 的返回值中添加设置
    - 在 setWebviewMessageListener 中添加一个 case 来处理设置的消息类型
    - 示例：
        ```typescript
        case "multisearchDiffEnabled":
          await this.updateGlobalState("multisearchDiffEnabled", message.bool)
          await this.postStateToWebview()
          break
        ```

4. 在 SettingsView.tsx 中添加复选框 UI：

    - 从 ExtensionStateContext 导入设置及其设置器
    - 添加带有设置状态和 onChange 处理程序的 VSCodeCheckbox 组件
    - 添加适当的标签和描述文本
    - 示例：
        ```typescript
        <VSCodeCheckbox
          checked={multisearchDiffEnabled}
          onChange={(e: any) => setMultisearchDiffEnabled(e.target.checked)}
        >
          <span style={{ fontWeight: "500" }}>Enable multi-search diff matching</span>
        </VSCodeCheckbox>
        ```

5. 在 SettingsView.tsx 的 handleSubmit 中添加设置：
    - 添加 vscode.postMessage 调用，在点击"完成"时发送设置的值
    - 示例：
        ```typescript
        vscode.postMessage({ type: "multisearchDiffEnabled", bool: multisearchDiffEnabled })
        ```

## 对于选择/下拉设置

1. 将消息类型添加到 WebviewMessage.ts：

    - 将设置名称添加到 WebviewMessage 类型的类型联合
    - 示例：`| "preferredLanguage"`

2. 将设置添加到 ExtensionStateContext.tsx：

    - 将设置添加到 ExtensionStateContextType 接口
    - 将设置器函数添加到接口
    - 在 useState 中将设置添加到初始状态并设置默认值
    - 将设置添加到 contextValue 对象
    - 示例：
        ```typescript
        interface ExtensionStateContextType {
        	preferredLanguage: string
        	setPreferredLanguage: (value: string) => void
        }
        ```

3. 将设置添加到 ClineProvider.ts：

    - 将设置名称添加到 GlobalStateKey 类型联合
    - 在 getState 的 Promise.all 数组中添加设置
    - 在 getState 的返回值中添加设置并设置默认值
    - 在 getStateToPostToWebview 中将设置添加到解构变量
    - 在 getStateToPostToWebview 的返回值中添加设置
    - 在 setWebviewMessageListener 中添加一个 case 来处理设置的消息类型
    - 示例：
        ```typescript
        case "preferredLanguage":
          await this.updateGlobalState("preferredLanguage", message.text)
          await this.postStateToWebview()
          break
        ```

4. 在 SettingsView.tsx 中添加选择 UI：

    - 从 ExtensionStateContext 导入设置及其设置器
    - 添加带有适当样式的选择元素，以匹配 VSCode 的主题
    - 为下拉列表添加选项
    - 添加适当的标签和描述文本
    - 示例：
        ```typescript
        <select
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value)}
          style={{
            width: "100%",
            padding: "4px 8px",
            backgroundColor: "var(--vscode-input-background)",
            color: "var(--vscode-input-foreground)",
            border: "1px solid var(--vscode-input-border)",
            borderRadius: "2px"
          }}>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          ...
        </select>
        ```

5. 在 SettingsView.tsx 的 handleSubmit 中添加设置：
    - 添加 vscode.postMessage 调用，在点击"完成"时发送设置的值
    - 示例：
        ```typescript
        vscode.postMessage({ type: "preferredLanguage", text: preferredLanguage })
        ```

这些步骤确保：

- 设置的状态在整个应用程序中都有适当的类型
- 设置在会话之间持久保存
- 设置的值在 webview 和扩展之间正确同步
- 设置在设置视图中有适当的 UI 表示
- 为新设置维护测试覆盖
