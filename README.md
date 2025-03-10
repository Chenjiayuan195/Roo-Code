<div align="center">
<h1>Magic Code</h1>
<h3>一款辅助web开发的AI编程助手<h3>
</div>

## 本地LLM设置

1.  **API Provider设置（如需重新设置，请打开顶部设置按钮设置）**
    ```bash
    1. 选择 openAI Compatible
    2. Base URL:http://10.12.154.118:7000/v1
    3. API Key：NoApiKeyNeeded
    4. Model输入:qwq-32b
    5. 开始使用
    ```

## 本地开发

1. **Install dependencies**:
    ```bash
    npm run install:all
    ```

if that fails, try:
`bash
    npm run install:ci
    `

2. **Build** the extension:
    ```bash
    npm run build
    ```
    - `.vsix` 文件将会出现在 `bin/` 文件夹下.
3. **Install** the `.vsix`:
    ```bash
    code --install-extension bin/magic-code-1.0.0.vsix
    ```
4. **Start the webview (Vite/React app with HMR)**:
    ```bash
    npm run dev
    ```
