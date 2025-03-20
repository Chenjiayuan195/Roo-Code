<div align="center">
<h1>Magic Code</h1>
<h3>一款辅助开发的AI编程助手<h3>
</div>

## 默认存储路径修改（避免C盘被占满）

`````bash
    1.按下 Ctrl+Shift+P（Windows/Linux）或 Cmd+Shift+P（macOS）打开命令面板
    2.输入 "Magic Code: 设置自定义对话存储路径" 并选择该命令
    3.在弹出的输入框中，输入您想要的自定义路径，例如：D:\MagicCodeStorage
    4.按下 Enter 确认
    ```



## Terminal配置

针对windows系统，我们需要更改Terminal的默认使用

````bash
    vscode指令：Ctrl + Shift + P
    输入：Terminal: Select Default Profile
    选择：Git Bash
    ```


## 以下是黑魔法，教你如何使用github Copilot的cluade3.7（公网环境）

假设你已经开通了github Copilot的pro免费使用30天

1.mac用户

````bash
    1.打开： ~/.vscode/extensions/ （可采用command+shift+. 打开隐藏文件）
    2.找到：github.copilot-chat-<version>
    3.进入：dist/extension.js
    4.搜索：x-onbehalf-extension-id
    5.删除：,"x-onbehalf-extension-id":`${A}/${c}`并保存
    6.重新启动vscode
    ```
`````

2.windows用户

````bash
    1.打开：%USERPROFILE%\.vscode\extensions\
    2.找到：github.copilot-chat-<version>
    3.进入：dist/extension.js
    4.搜索：x-onbehalf-extension-id
    5.删除：,"x-onbehalf-extension-id":`${A}/${c}`并保存
    6.重新启动vscode
    ```
````

3. 取消github copilot自动更新

4. API供应商选用 VS Code LM API 并将请求速率限制选择3s
