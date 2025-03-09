import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useState } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"

interface AutoApproveAction {
	id: string
	label: string
	enabled: boolean
	shortName: string
	description: string
}

interface AutoApproveMenuProps {
	style?: React.CSSProperties
}

const AutoApproveMenu = ({ style }: AutoApproveMenuProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const {
		alwaysAllowReadOnly,
		setAlwaysAllowReadOnly,
		alwaysAllowWrite,
		setAlwaysAllowWrite,
		alwaysAllowExecute,
		setAlwaysAllowExecute,
		alwaysAllowBrowser,
		setAlwaysAllowBrowser,
		alwaysAllowMcp,
		setAlwaysAllowMcp,
		alwaysAllowModeSwitch,
		setAlwaysAllowModeSwitch,
		alwaysAllowFinishTask,
		setAlwaysAllowFinishTask,
		alwaysApproveResubmit,
		setAlwaysApproveResubmit,
		autoApprovalEnabled,
		setAutoApprovalEnabled,
	} = useExtensionState()

	const actions: AutoApproveAction[] = [
		{
			id: "readFiles",
			label: "读取文件和目录",
			shortName: "读取",
			enabled: alwaysAllowReadOnly ?? false,
			description: "允许访问并读取您计算机上的任何文件。",
		},
		{
			id: "editFiles",
			label: "编辑文件",
			shortName: "编辑",
			enabled: alwaysAllowWrite ?? false,
			description: "允许修改您计算机上的任何文件。",
		},
		{
			id: "executeCommands",
			label: "执行批准的命令",
			shortName: "命令",
			enabled: alwaysAllowExecute ?? false,
			description:
				"允许执行已批准的终端命令。您可以在设置面板中配置这些命令。",
		},
		{
			id: "useBrowser",
			label: "使用浏览器",
			shortName: "浏览器",
			enabled: alwaysAllowBrowser ?? false,
			description: "允许在无头浏览器中启动和与任何网站交互。",
		},
		{
			id: "useMcp",
			label: "使用MCP服务器",
			shortName: "MCP",
			enabled: alwaysAllowMcp ?? false,
			description: "允许使用配置的MCP服务器，这些服务器可能会修改文件系统或与API交互。",
		},
		{
			id: "switchModes",
			label: "切换模式和创建任务",
			shortName: "模式",
			enabled: alwaysAllowModeSwitch ?? false,
			description:
				"允许自动在不同的AI模式之间切换，并无需批准即可创建新任务。",
		},
		{
			id: "finishTask",
			label: "继续下一个任务",
			shortName: "继续",
			enabled: alwaysAllowFinishTask ?? false,
			description: "允许任务结束执行并继续下一个任务，无需用户审核或批准。",
		},
		{
			id: "retryRequests",
			label: "重试失败的请求",
			shortName: "重试",
			enabled: alwaysApproveResubmit ?? false,
			description: "当提供商返回错误响应时自动重试失败的API请求。",
		},
	]

	const toggleExpanded = useCallback(() => {
		setIsExpanded((prev) => !prev)
	}, [])

	const enabledActionsList = actions
		.filter((action) => action.enabled)
		.map((action) => action.shortName)
		.join(", ")

	// Individual checkbox handlers - each one only updates its own state
	const handleReadOnlyChange = useCallback(() => {
		const newValue = !(alwaysAllowReadOnly ?? false)
		setAlwaysAllowReadOnly(newValue)
		vscode.postMessage({ type: "alwaysAllowReadOnly", bool: newValue })
	}, [alwaysAllowReadOnly, setAlwaysAllowReadOnly])

	const handleWriteChange = useCallback(() => {
		const newValue = !(alwaysAllowWrite ?? false)
		setAlwaysAllowWrite(newValue)
		vscode.postMessage({ type: "alwaysAllowWrite", bool: newValue })
	}, [alwaysAllowWrite, setAlwaysAllowWrite])

	const handleExecuteChange = useCallback(() => {
		const newValue = !(alwaysAllowExecute ?? false)
		setAlwaysAllowExecute(newValue)
		vscode.postMessage({ type: "alwaysAllowExecute", bool: newValue })
	}, [alwaysAllowExecute, setAlwaysAllowExecute])

	const handleBrowserChange = useCallback(() => {
		const newValue = !(alwaysAllowBrowser ?? false)
		setAlwaysAllowBrowser(newValue)
		vscode.postMessage({ type: "alwaysAllowBrowser", bool: newValue })
	}, [alwaysAllowBrowser, setAlwaysAllowBrowser])

	const handleMcpChange = useCallback(() => {
		const newValue = !(alwaysAllowMcp ?? false)
		setAlwaysAllowMcp(newValue)
		vscode.postMessage({ type: "alwaysAllowMcp", bool: newValue })
	}, [alwaysAllowMcp, setAlwaysAllowMcp])

	const handleModeSwitchChange = useCallback(() => {
		const newValue = !(alwaysAllowModeSwitch ?? false)
		setAlwaysAllowModeSwitch(newValue)
		vscode.postMessage({ type: "alwaysAllowModeSwitch", bool: newValue })
	}, [alwaysAllowModeSwitch, setAlwaysAllowModeSwitch])

	const handleFinishTaskChange = useCallback(() => {
		const newValue = !(alwaysAllowFinishTask ?? false)
		setAlwaysAllowFinishTask(newValue)
		vscode.postMessage({ type: "alwaysAllowFinishTask", bool: newValue })
	}, [alwaysAllowFinishTask, setAlwaysAllowFinishTask])

	const handleRetryChange = useCallback(() => {
		const newValue = !(alwaysApproveResubmit ?? false)
		setAlwaysApproveResubmit(newValue)
		vscode.postMessage({ type: "alwaysApproveResubmit", bool: newValue })
	}, [alwaysApproveResubmit, setAlwaysApproveResubmit])

	// Map action IDs to their specific handlers
	const actionHandlers: Record<AutoApproveAction["id"], () => void> = {
		readFiles: handleReadOnlyChange,
		editFiles: handleWriteChange,
		executeCommands: handleExecuteChange,
		useBrowser: handleBrowserChange,
		useMcp: handleMcpChange,
		switchModes: handleModeSwitchChange,
		finishTask: handleFinishTaskChange,
		retryRequests: handleRetryChange,
	}

	return (
		<div
			style={{
				padding: "0 15px",
				userSelect: "none",
				borderTop: isExpanded
					? `0.5px solid color-mix(in srgb, var(--vscode-titleBar-inactiveForeground) 20%, transparent)`
					: "none",
				overflowY: "auto",
				...style,
			}}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					padding: isExpanded ? "8px 0" : "8px 0 0 0",
					cursor: "pointer",
				}}
				onClick={toggleExpanded}>
				<div onClick={(e) => e.stopPropagation()}>
					<VSCodeCheckbox
						checked={autoApprovalEnabled ?? false}
						onChange={() => {
							const newValue = !(autoApprovalEnabled ?? false)
							setAutoApprovalEnabled(newValue)
							vscode.postMessage({ type: "autoApprovalEnabled", bool: newValue })
						}}
					/>
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "4px",
						flex: 1,
						minWidth: 0,
					}}>
					<span
						style={{
							color: "var(--vscode-foreground)",
							flexShrink: 0,
						}}>
						自动批准:
					</span>
					<span
						style={{
							color: "var(--vscode-descriptionForeground)",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							flex: 1,
							minWidth: 0,
						}}>
						{enabledActionsList || "无"}
					</span>
					<span
						className={`codicon codicon-chevron-${isExpanded ? "down" : "right"}`}
						style={{
							flexShrink: 0,
							marginLeft: isExpanded ? "2px" : "-2px",
						}}
					/>
				</div>
			</div>
			{isExpanded && (
				<div style={{ padding: "0" }}>
					<div
						style={{
							marginBottom: "10px",
							color: "var(--vscode-descriptionForeground)",
							fontSize: "12px",
						}}>
						自动批准允许 Magic Code 在不询问许可的情况下执行操作。仅对您完全信任的操作启用此功能。
					</div>
					{actions.map((action) => (
						<div key={action.id} style={{ margin: "6px 0" }}>
							<div onClick={(e) => e.stopPropagation()}>
								<VSCodeCheckbox checked={action.enabled} onChange={actionHandlers[action.id]}>
									{action.label}
								</VSCodeCheckbox>
							</div>
							<div
								style={{
									marginLeft: "28px",
									color: "var(--vscode-descriptionForeground)",
									fontSize: "12px",
								}}>
								{action.description}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default AutoApproveMenu
