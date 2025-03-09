import { HTMLAttributes } from "react"

import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

import { vscode } from "@/utils/vscode"
import { cn } from "@/lib/utils"
import { TelemetrySetting } from "../../../../src/shared/TelemetrySetting"

type SettingsFooterProps = HTMLAttributes<HTMLDivElement> & {
	version: string
	telemetrySetting: TelemetrySetting
	setTelemetrySetting: (setting: TelemetrySetting) => void
}

export const SettingsFooter = ({
	version,
	telemetrySetting,
	setTelemetrySetting,
	className,
	...props
}: SettingsFooterProps) => (
	<div className={cn("text-vscode-descriptionForeground p-5", className)} {...props}>
		<p className="italic">Magic Code v{version}</p>
		<div className="mt-4 mb-4">
			<div>
			</div>
		</div>
		<div className="flex justify-between items-center gap-3">
			<p>重置扩展中的所有全局状态和密钥存储。</p>
			<VSCodeButton
				onClick={() => vscode.postMessage({ type: "resetState" })}
				appearance="secondary"
				className="shrink-0">
				<span className="codicon codicon-warning text-vscode-errorForeground mr-1" />
				重置
			</VSCodeButton>
		</div>
	</div>
)
