import { HTMLAttributes } from "react"
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { Cog } from "lucide-react"

import { EXPERIMENT_IDS, ExperimentId } from "../../../../src/shared/experiments"
import { TERMINAL_OUTPUT_LIMIT } from "../../../../src/shared/terminal"

import { cn } from "@/lib/utils"

import { SetCachedStateField, SetExperimentEnabled } from "./types"
import { sliderLabelStyle } from "./styles"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"

type AdvancedSettingsProps = HTMLAttributes<HTMLDivElement> & {
	rateLimitSeconds: number
	terminalOutputLimit?: number
	maxOpenTabsContext: number
	diffEnabled?: boolean
	fuzzyMatchThreshold?: number
	showRooIgnoredFiles?: boolean
	setCachedStateField: SetCachedStateField<
		| "rateLimitSeconds"
		| "terminalOutputLimit"
		| "maxOpenTabsContext"
		| "diffEnabled"
		| "fuzzyMatchThreshold"
		| "showRooIgnoredFiles"
	>
	experiments: Record<ExperimentId, boolean>
	setExperimentEnabled: SetExperimentEnabled
}
export const AdvancedSettings = ({
	rateLimitSeconds,
	terminalOutputLimit = TERMINAL_OUTPUT_LIMIT,
	maxOpenTabsContext,
	diffEnabled,
	fuzzyMatchThreshold,
	showRooIgnoredFiles,
	setCachedStateField,
	experiments,
	setExperimentEnabled,
	className,
	...props
}: AdvancedSettingsProps) => {
	return (
		<div className={cn("flex flex-col gap-2", className)} {...props}>
			<SectionHeader>
				<div className="flex items-center gap-2">
					<Cog className="w-4" />
					<div>高级设置</div>
				</div>
			</SectionHeader>

			<Section>
				<div>
					<div className="flex flex-col gap-2">
						<span className="font-medium">速率限制</span>
						<div className="flex items-center gap-2">
							<input
								type="range"
								min="0"
								max="60"
								step="1"
								value={rateLimitSeconds}
								onChange={(e) => setCachedStateField("rateLimitSeconds", parseInt(e.target.value))}
								className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
							/>
							<span style={{ ...sliderLabelStyle }}>{rateLimitSeconds}秒</span>
						</div>
					</div>
					<p className="text-vscode-descriptionForeground text-sm mt-0">API请求之间的最小时间间隔。</p>
				</div>

				<div>
					<div className="flex flex-col gap-2">
						<span className="font-medium">终端输出限制</span>
						<div className="flex items-center gap-2">
							<input
								type="range"
								min={1024}
								max={1024 * 1024}
								step={1024}
								value={terminalOutputLimit}
								onChange={(e) => setCachedStateField("terminalOutputLimit", parseInt(e.target.value))}
								className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
							/>
							<span style={{ ...sliderLabelStyle }}>{Math.floor(terminalOutputLimit / 1024)} KB</span>
						</div>
					</div>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						执行命令时发送给LLM的最大终端输出量（以KB为单位）。如果输出超过此限制，将删除中间部分，以保留输出的开头和结尾。
					</p>
				</div>

				<div>
					<div className="flex flex-col gap-2">
						<span className="font-medium">打开标签页上下文限制</span>
						<div className="flex items-center gap-2">
							<input
								type="range"
								min="0"
								max="500"
								step="1"
								value={maxOpenTabsContext ?? 20}
								onChange={(e) => setCachedStateField("maxOpenTabsContext", parseInt(e.target.value))}
								className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
							/>
							<span style={{ ...sliderLabelStyle }}>{maxOpenTabsContext ?? 20}</span>
						</div>
					</div>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						在上下文中包含的VSCode打开标签页的最大数量。较高的值提供更多上下文，但会增加令牌使用量。
					</p>
				</div>

				<div>
					<VSCodeCheckbox
						checked={diffEnabled}
						onChange={(e: any) => {
							setCachedStateField("diffEnabled", e.target.checked)
							if (!e.target.checked) {
								// 禁用差异时重置两种实验性策略。
								setExperimentEnabled(EXPERIMENT_IDS.DIFF_STRATEGY, false)
								setExperimentEnabled(EXPERIMENT_IDS.MULTI_SEARCH_AND_REPLACE, false)
							}
						}}>
						<span className="font-medium">启用通过差异编辑</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						启用后，Magic将能够更快地编辑文件，并自动拒绝截断的全文件写入。最适合与最新的Claude 3.7 Sonnet模型配合使用。
					</p>
					{diffEnabled && (
						<div className="flex flex-col gap-2 mt-3 mb-2 pl-3 border-l-2 border-vscode-button-background">
							<div className="flex flex-col gap-2">
								<span className="font-medium">差异策略</span>
								<select
									value={
										experiments[EXPERIMENT_IDS.DIFF_STRATEGY]
											? "unified"
											: experiments[EXPERIMENT_IDS.MULTI_SEARCH_AND_REPLACE]
												? "multiBlock"
												: "standard"
									}
									onChange={(e) => {
										const value = e.target.value
										if (value === "standard") {
											setExperimentEnabled(EXPERIMENT_IDS.DIFF_STRATEGY, false)
											setExperimentEnabled(EXPERIMENT_IDS.MULTI_SEARCH_AND_REPLACE, false)
										} else if (value === "unified") {
											setExperimentEnabled(EXPERIMENT_IDS.DIFF_STRATEGY, true)
											setExperimentEnabled(EXPERIMENT_IDS.MULTI_SEARCH_AND_REPLACE, false)
										} else if (value === "multiBlock") {
											setExperimentEnabled(EXPERIMENT_IDS.DIFF_STRATEGY, false)
											setExperimentEnabled(EXPERIMENT_IDS.MULTI_SEARCH_AND_REPLACE, true)
										}
									}}
									className="p-2 rounded w-full bg-vscode-input-background text-vscode-input-foreground border border-vscode-input-border outline-none focus:border-vscode-focusBorder">
									<option value="standard">标准（单块）</option>
									<option value="multiBlock">实验性：多块差异</option>
									<option value="unified">实验性：统一差异</option>
								</select>
							</div>

							{/* 所选策略的描述 */}
							<p className="text-vscode-descriptionForeground text-sm mt-1">
								{!experiments[EXPERIMENT_IDS.DIFF_STRATEGY] &&
									!experiments[EXPERIMENT_IDS.MULTI_SEARCH_AND_REPLACE] &&
									"标准差异策略一次只应用对单个代码块的更改。"}
								{experiments[EXPERIMENT_IDS.DIFF_STRATEGY] &&
									"统一差异策略采用多种方法应用差异，并选择最佳方法。"}
								{experiments[EXPERIMENT_IDS.MULTI_SEARCH_AND_REPLACE] &&
									"多块差异策略允许在一个请求中更新文件中的多个代码块。"}
							</p>

							{/* 匹配精度滑块 */}
							<span className="font-medium mt-3">匹配精度</span>
							<div className="flex items-center gap-2">
								<input
									type="range"
									min="0.8"
									max="1"
									step="0.005"
									value={fuzzyMatchThreshold ?? 1.0}
									onChange={(e) => {
										setCachedStateField("fuzzyMatchThreshold", parseFloat(e.target.value))
									}}
									className="h-2 focus:outline-0 w-4/5 accent-vscode-button-background"
								/>
								<span style={{ ...sliderLabelStyle }}>
									{Math.round((fuzzyMatchThreshold || 1) * 100)}%
								</span>
							</div>
							<p className="text-vscode-descriptionForeground text-sm mt-0">
								此滑块控制应用差异时代码段必须匹配的精确度。较低的值允许更灵活的匹配，但会增加错误替换的风险。极其谨慎地使用低于100%的值。
							</p>
						</div>
					)}
				</div>

				<div>
					<VSCodeCheckbox
						checked={showRooIgnoredFiles}
						onChange={(e: any) => {
							setCachedStateField("showRooIgnoredFiles", e.target.checked)
						}}>
						<span className="font-medium">在列表和搜索中显示.rooignore文件</span>
					</VSCodeCheckbox>
					<p className="text-vscode-descriptionForeground text-sm mt-0">
						启用后，匹配.rooignore中模式的文件将在列表中显示锁定符号。禁用时，这些文件将完全从文件列表和搜索中隐藏。
					</p>
				</div>
			</Section>
		</div>
	)
}
