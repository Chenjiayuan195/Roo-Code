
<div align="center">
<h1>Magic Code</h1>
<h3>一款辅助web开发的AI编程助手<h3>
</div>

## 本地开发

1. **Install dependencies**:
    ```bash
    npm run install:all
    ```

if that fails, try:
    ```bash
    npm run install:ci
    ```

2. **Build** the extension:
    ```bash
    npm run build
    ```
    -  `.vsix` 文件将会出现在 `bin/` 文件夹下.
3. **Install** the `.vsix`:
    ```bash
    code --install-extension bin/magic-code-1.0.0.vsix
    ```
4. **Start the webview (Vite/React app with HMR)**:
    ```bash
    npm run dev
    ```

