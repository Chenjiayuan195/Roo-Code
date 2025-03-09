import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo, useState } from "react"
import styled from "styled-components"
import { vscode } from "../../utils/vscode"
import { TelemetrySetting } from "../../../../src/shared/TelemetrySetting"

const BannerContainer = styled.div`
	background-color: var(--vscode-banner-background);
	padding: 12px 20px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	flex-shrink: 0;
	margin-bottom: 6px;
`

const ButtonContainer = styled.div`
	display: flex;
	gap: 8px;
	width: 100%;
	& > vscode-button {
		flex: 1;
	}
`

const TelemetryBanner = () => {
	const [hasChosen, setHasChosen] = useState(false)

	const handleAllow = () => {
		setHasChosen(true)
		vscode.postMessage({ type: "telemetrySetting", text: "enabled" satisfies TelemetrySetting })
	}

	const handleDeny = () => {
		setHasChosen(true)
		vscode.postMessage({ type: "telemetrySetting", text: "disabled" satisfies TelemetrySetting })
	}

	const handleOpenSettings = () => {
		window.postMessage({ type: "action", action: "settingsButtonClicked" })
	}

	return (
		<BannerContainer>
			<div>
				<strong>Magic Code</strong>
				<div className="mt-1">
					本插件由产品工程院Web前端开发部开发，旨在帮助Web开发人员编写代码。
					<div className="mt-1">
						您可以随时在扩展底部更改此设置。
						<VSCodeLink href="#" onClick={handleOpenSettings}>
							设置
						</VSCodeLink>
						.
					</div>
				</div>
			</div>
			<ButtonContainer>
				<VSCodeButton appearance="secondary" onClick={handleDeny} disabled={hasChosen}>
					关闭
				</VSCodeButton>
			</ButtonContainer>
		</BannerContainer>
	)
}

export default memo(TelemetryBanner)
