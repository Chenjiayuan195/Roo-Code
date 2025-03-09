import * as React from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { useClipboard } from "../ui/hooks"
import { Check, Copy, X } from "lucide-react"

interface HumanRelayDialogProps {
	isOpen: boolean
	onClose: () => void
	requestId: string
	promptText: string
	onSubmit: (requestId: string, text: string) => void
	onCancel: (requestId: string) => void
}

/**
 * Human Relay Dialog Component
 * Displays the prompt text that needs to be copied and provides an input box for the user to paste the AI's response.
 */
export const HumanRelayDialog: React.FC<HumanRelayDialogProps> = ({
	isOpen,
	onClose,
	requestId,
	promptText,
	onSubmit,
	onCancel,
}) => {
	const [response, setResponse] = React.useState("")
	const { copy } = useClipboard()
	const [isCopyClicked, setIsCopyClicked] = React.useState(false)

	// Listen to isOpen changes, clear the input box when the dialog box is opened
	React.useEffect(() => {
		if (isOpen) {
			setResponse("")
			setIsCopyClicked(false)
		}
	}, [isOpen])

	// Copy to clipboard and show a success message
	const handleCopy = () => {
		copy(promptText)
		setIsCopyClicked(true)
		setTimeout(() => {
			setIsCopyClicked(false)
		}, 2000)
	}

	// Submit the response
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (response.trim()) {
			onSubmit(requestId, response)
			onClose()
		}
	}

	// Cancel the operation
	const handleCancel = () => {
		onCancel(requestId)
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>人工中继 - 请帮助复制和粘贴信息</DialogTitle>
					<DialogDescription>
						请将以下文字复制到网页AI，然后将AI的回复粘贴到下方的输入框中。
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="relative">
						<Textarea
							className="min-h-[200px] font-mono text-sm p-4 pr-12 whitespace-pre-wrap"
							value={promptText}
							readOnly
						/>
						<Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
							{isCopyClicked ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
						</Button>
					</div>

					{isCopyClicked && <div className="text-sm text-emerald-500 font-medium">已复制到剪贴板</div>}

					<div>
						<div className="mb-2 font-medium">请输入AI的回复：</div>
						<Textarea
							placeholder="在此粘贴AI的回复..."
							value={response}
							onChange={(e) => setResponse(e.target.value)}
							className="min-h-[150px]"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleCancel} className="gap-1">
						<X className="h-4 w-4" />
						取消
					</Button>
					<Button onClick={handleSubmit} disabled={!response.trim()} className="gap-1">
						<Check className="h-4 w-4" />
						提交
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
