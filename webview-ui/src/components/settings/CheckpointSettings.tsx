import { HTMLAttributes } from "react"
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { GitBranch } from "lucide-react"

import { CheckpointStorage } from "../../../../src/shared/checkpoints"

import { SetCachedStateField } from "./types"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"

type CheckpointSettingsProps = HTMLAttributes<HTMLDivElement> & {
	enableCheckpoints?: boolean
	checkpointStorage?: CheckpointStorage
	setCachedStateField: SetCachedStateField<"enableCheckpoints" | "checkpointStorage">
}

export const CheckpointSettings = ({
	enableCheckpoints,
	checkpointStorage = "task",
	setCachedStateField,
	...props
}: CheckpointSettingsProps) => {
	return (
		<div {...props}>
			<SectionHeader>
				<div className="flex items-center gap-2">
					<GitBranch className="w-4" />
					<div>检查点</div>
				</div>
			</SectionHeader>

			<Section>
				<div>
					<VSCodeCheckbox
						checked={enableCheckpoints}
						onChange={(e: any) => {
							setCachedStateField("enableCheckpoints", e.target.checked)
						}}>
						<span className="font-medium">启用自动检查点</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						启用后，Magic将在任务执行期间自动创建检查点，使审查更改或恢复到早期状态变得容易。
					</p>
				</div>
			</Section>
		</div>
	)
}
