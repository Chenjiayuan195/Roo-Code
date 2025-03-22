import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo, useState } from "react"
import styled from "styled-components"
import { vscode } from "../../utils/vscode"
import { TelemetrySetting } from "../../../../src/shared/TelemetrySetting"
import { useAppTranslation } from "../../i18n/TranslationContext"
import { Trans } from "react-i18next"

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
	const { t } = useAppTranslation()
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
		<></>
	)
}

export default memo(TelemetryBanner)
