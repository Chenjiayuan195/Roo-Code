
<div align="center">
<h1>Magic Code</h1>
</div>

## 本地开发

1. **Clone** the repo:
    ```bash
    git clone https://github.com/RooVetGit/Magic-Code.git
    ```
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
    - A `.vsix` file will appear in the `bin/` directory.
3. **Install** the `.vsix` manually if desired:
    ```bash
    code --install-extension bin/magic-code-1.0.0.vsix
    ```
4. **Start the webview (Vite/React app with HMR)**:
    ```bash
    npm run dev
    ```

