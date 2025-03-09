import { HTMLAttributes } from "react"
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { Dropdown, type DropdownOption } from "vscrui"
import { SquareMousePointer } from "lucide-react"

import { SetCachedStateField } from "./types"
import { sliderLabelStyle } from "./styles"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"

type BrowserSettingsProps = HTMLAttributes<HTMLDivElement> & {
	browserToolEnabled?: boolean
	browserViewportSize?: string
	screenshotQuality?: number
	setCachedStateField: SetCachedStateField<"browserToolEnabled" | "browserViewportSize" | "screenshotQuality">
}

export const BrowserSettings = ({
	browserToolEnabled,
	browserViewportSize,
	screenshotQuality,
	setCachedStateField,
	...props
}: BrowserSettingsProps) => {
	return (
		<div {...props}>
			<SectionHeader>
				<div className="flex items-center gap-2">
					<SquareMousePointer className="w-4" />
					<div>浏览器 / 计算机使用</div>
				</div>
			</SectionHeader>

			<Section>
				<div>
					<VSCodeCheckbox
						checked={browserToolEnabled}
						onChange={(e: any) => setCachedStateField("browserToolEnabled", e.target.checked)}>
						<span className="font-medium">启用浏览器工具</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						启用后，Magic可以在使用支持计算机使用的模型时通过浏览器与网站交互。
					</p>
					{browserToolEnabled && (
						<div
							style={{
								marginLeft: 0,
								paddingLeft: 10,
								borderLeft: "2px solid var(--vscode-button-background)",
							}}>
							<div>
								<label style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
									视口大小
								</label>
								<div className="dropdown-container">
									<Dropdown
										value={browserViewportSize}
										onChange={(value: unknown) => {
											setCachedStateField("browserViewportSize", (value as DropdownOption).value)
										}}
										style={{ width: "100%" }}
										options={[
											{ value: "1280x800", label: "大型桌面 (1280x800)" },
											{ value: "900x600", label: "小型桌面 (900x600)" },
											{ value: "768x1024", label: "平板 (768x1024)" },
											{ value: "360x640", label: "移动设备 (360x640)" },
										]}
									/>
								</div>
								<p className="text-vscode-descriptionForeground text-sm mt-0">
									选择浏览器交互的视口大小。这会影响网站的显示和交互方式。
								</p>
							</div>
							<div>
								<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
									<span className="font-medium">截图质量</span>
									<div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
										<input
											type="range"
											min="1"
											max="100"
											step="1"
											value={screenshotQuality ?? 75}
											className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
											onChange={(e) =>
												setCachedStateField("screenshotQuality", parseInt(e.target.value))
											}
										/>
										<span style={{ ...sliderLabelStyle }}>{screenshotQuality ?? 75}%</span>
									</div>
								</div>
								<p className="text-vscode-descriptionForeground text-sm mt-0">
									调整浏览器截图的WebP质量。较高的值提供更清晰的截图但会增加令牌使用量。
								</p>
							</div>
						</div>
					)}
				</div>
			</Section>
		</div>
	)
}
