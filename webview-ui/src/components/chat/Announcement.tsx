import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { Trans } from "react-i18next"

interface AnnouncementProps {
	version: string
	hideAnnouncement: () => void
}
/*
You must update the latestAnnouncementId in ClineProvider for new announcements to show to users. This new id will be compared with whats in state for the 'last announcement shown', and if it's different then the announcement will render. As soon as an announcement is shown, the id will be updated in state. This ensures that announcements are not shown more than once, even if the user doesn't close it themselves.
*/
const Announcement = ({ version, hideAnnouncement }: AnnouncementProps) => {
	const { t } = useAppTranslation()

	const discordLink = (
		<VSCodeLink
			href="https://discord.gg/roocode"
			onClick={(e) => {
				e.preventDefault()
				window.postMessage(
					{ type: "action", action: "openExternal", data: { url: "https://discord.gg/roocode" } },
					"*",
				)
			}}>
			Discord
		</VSCodeLink>
	)

	const redditLink = (
		<VSCodeLink
			href="https://reddit.com/r/RooCode"
			onClick={(e) => {
				e.preventDefault()
				window.postMessage(
					{ type: "action", action: "openExternal", data: { url: "https://reddit.com/r/RooCode" } },
					"*",
				)
			}}>
			Reddit
		</VSCodeLink>
	)

	return (
		<></>
	)
}

export default memo(Announcement)
