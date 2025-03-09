import { HTMLAttributes, useState } from "react"
import { VSCodeButton, VSCodeCheckbox, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { CheckCheck } from "lucide-react"

import { vscode } from "@/utils/vscode"
import { ExtensionStateContextType } from "@/context/ExtensionStateContext"

import { SetCachedStateField } from "./types"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"

type AutoApproveSettingsProps = HTMLAttributes<HTMLDivElement> & {
	alwaysAllowReadOnly?: boolean
	alwaysAllowWrite?: boolean
	writeDelayMs: number
	alwaysAllowBrowser?: boolean
	alwaysApproveResubmit?: boolean
	requestDelaySeconds: number
	alwaysAllowMcp?: boolean
	alwaysAllowModeSwitch?: boolean
	alwaysAllowFinishTask?: boolean
	alwaysAllowExecute?: boolean
	allowedCommands?: string[]
	setCachedStateField: SetCachedStateField<keyof ExtensionStateContextType>
}

export const AutoApproveSettings = ({
	alwaysAllowReadOnly,
	alwaysAllowWrite,
	writeDelayMs,
	alwaysAllowBrowser,
	alwaysApproveResubmit,
	requestDelaySeconds,
	alwaysAllowMcp,
	alwaysAllowModeSwitch,
	alwaysAllowFinishTask,
	alwaysAllowExecute,
	allowedCommands,
	setCachedStateField,
	className,
	...props
}: AutoApproveSettingsProps) => {
	const [commandInput, setCommandInput] = useState("")

	const handleAddCommand = () => {
		const currentCommands = allowedCommands ?? []
		if (commandInput && !currentCommands.includes(commandInput)) {
			const newCommands = [...currentCommands, commandInput]
			setCachedStateField("allowedCommands", newCommands)
			setCommandInput("")
			vscode.postMessage({ type: "allowedCommands", commands: newCommands })
		}
	}

	return (
		<div {...props}>
			<SectionHeader description="允许 Magic 自动执行操作而无需批准。仅在您完全信任 AI 并了解相关安全风险的情况下启用这些设置。">
				<div className="flex items-center gap-2">
					<CheckCheck className="w-4" />
					<div>自动批准</div>
				</div>
			</SectionHeader>

			<Section>
				<div>
					<VSCodeCheckbox
						checked={alwaysAllowReadOnly}
						onChange={(e: any) => setCachedStateField("alwaysAllowReadOnly", e.target.checked)}>
						<span className="font-medium">始终批准只读操作</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						启用后，Magic 将自动查看目录内容和读取文件，无需您点击批准按钮。
					</p>
				</div>

				<div>
					<VSCodeCheckbox
						checked={alwaysAllowWrite}
						onChange={(e: any) => setCachedStateField("alwaysAllowWrite", e.target.checked)}>
						<span className="font-medium">始终批准写入操作</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						自动创建和编辑文件，无需批准
					</p>
					{alwaysAllowWrite && (
						<div
							style={{
								marginTop: 10,
								paddingLeft: 10,
								borderLeft: "2px solid var(--vscode-button-background)",
							}}>
							<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
								<input
									type="range"
									min="0"
									max="5000"
									step="100"
									value={writeDelayMs}
									onChange={(e) => setCachedStateField("writeDelayMs", parseInt(e.target.value))}
									className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
								/>
								<span style={{ minWidth: "45px", textAlign: "left" }}>{writeDelayMs}ms</span>
							</div>
							<p className="text-vscode-descriptionForeground text-sm mt-1">
								写入前延迟时间，以便您有时间查看更改
							</p>
						</div>
					)}
				</div>

				<div>
					<VSCodeCheckbox
						checked={alwaysAllowBrowser}
						onChange={(e: any) => setCachedStateField("alwaysAllowBrowser", e.target.checked)}>
						<span className="font-medium">始终批准浏览器访问</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						自动批准使用浏览器工具访问网站
					</p>
				</div>

				<div>
					<VSCodeCheckbox
						checked={alwaysAllowMcp}
						onChange={(e: any) => setCachedStateField("alwaysAllowMcp", e.target.checked)}>
						<span className="font-medium">始终批准 MCP 访问</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">自动批准使用 MCP 服务器</p>
				</div>

				<div>
					<VSCodeCheckbox
						checked={alwaysAllowModeSwitch}
						onChange={(e: any) => setCachedStateField("alwaysAllowModeSwitch", e.target.checked)}>
						<span className="font-medium">始终批准模式切换</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						自动批准 Magic 切换模式（如从 Helpful Mode 切换到 Expert Mode）
					</p>
				</div>

				<div>
					<VSCodeCheckbox
						checked={alwaysAllowFinishTask}
						onChange={(e: any) => setCachedStateField("alwaysAllowFinishTask", e.target.checked)}>
						<span className="font-medium">始终批准完成任务</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						自动批准 Magic 结束当前任务并开始新任务
					</p>
				</div>

				<div>
					<VSCodeCheckbox
						checked={alwaysApproveResubmit}
						onChange={(e: any) => setCachedStateField("alwaysApproveResubmit", e.target.checked)}>
						<span className="font-medium">始终批准重新提交</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						自动重试失败的请求（不建议在连接不稳定的情况下使用）
					</p>
				</div>

				<div>
					<VSCodeCheckbox
						checked={alwaysAllowExecute}
						onChange={(e: any) => setCachedStateField("alwaysAllowExecute", e.target.checked)}>
						<span className="font-medium">始终批准执行操作</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						自动批准执行终端命令（仅限下面列表中的命令）
					</p>
					
					{alwaysAllowExecute && (
						<div className="mt-4">
							<h5 className="m-0 mb-2">允许的命令列表</h5>
							<div className="flex gap-2 flex-wrap">
								{(allowedCommands || []).map((command, index) => (
									<div key={index} className="bg-vscode-badge-background py-1 px-2 rounded flex items-center gap-1">
										<span>{command}</span>
										<button
											className="ml-1 text-vscode-descriptionForeground hover:text-vscode-foreground"
											onClick={() => {
												const newCommands = (allowedCommands || []).filter((_, i) => i !== index)
												setCachedStateField("allowedCommands", newCommands)
												vscode.postMessage({ type: "allowedCommands", commands: newCommands })
											}}>
											×
										</button>
									</div>
								))}
							</div>
							
							<div className="flex mt-2 gap-2">
								<VSCodeTextField
									value={commandInput}
									onChange={(e: any) => setCommandInput(e.target.value)}
									placeholder="输入命令（例如：git status）"
								/>
								<VSCodeButton onClick={handleAddCommand} disabled={!commandInput.trim()}>
									添加
								</VSCodeButton>
							</div>
							
							<p className="text-vscode-descriptionForeground text-sm mt-2">
								注意：仅添加您信任的命令，因为它们将在无需批准的情况下执行
							</p>
						</div>
					)}
				</div>
			</Section>
		</div>
	)
}
