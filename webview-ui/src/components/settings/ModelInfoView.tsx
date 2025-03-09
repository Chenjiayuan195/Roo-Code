import { useMemo } from "react"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"

import { formatPrice } from "@/utils/formatPrice"
import { cn } from "@/lib/utils"

import { ModelInfo, geminiModels } from "../../../../src/shared/api"

import { ModelDescriptionMarkdown } from "./ModelDescriptionMarkdown"

type ModelInfoViewProps = {
	selectedModelId: string
	modelInfo: ModelInfo
	isDescriptionExpanded: boolean
	setIsDescriptionExpanded: (isExpanded: boolean) => void
}

export const ModelInfoView = ({
	selectedModelId,
	modelInfo,
	isDescriptionExpanded,
	setIsDescriptionExpanded,
}: ModelInfoViewProps) => {
	const isGemini = useMemo(() => Object.keys(geminiModels).includes(selectedModelId), [selectedModelId])

	const infoItems = [
		<ModelInfoSupportsItem
			isSupported={modelInfo.supportsImages ?? false}
			supportsLabel="支持图像"
			doesNotSupportLabel="不支持图像"
		/>,
		<ModelInfoSupportsItem
			isSupported={modelInfo.supportsComputerUse ?? false}
			supportsLabel="支持计算机使用"
			doesNotSupportLabel="不支持计算机使用"
		/>,
		!isGemini && (
			<ModelInfoSupportsItem
				isSupported={modelInfo.supportsPromptCache}
				supportsLabel="支持提示词缓存"
				doesNotSupportLabel="不支持提示词缓存"
			/>
		),
		modelInfo.maxTokens !== undefined && modelInfo.maxTokens > 0 && (
			<>
				<span className="font-medium">最大输出：</span> {modelInfo.maxTokens?.toLocaleString()} 令牌
			</>
		),
		modelInfo.inputPrice !== undefined && modelInfo.inputPrice > 0 && (
			<>
				<span className="font-medium">输入价格：</span> {formatPrice(modelInfo.inputPrice)} / 百万令牌
			</>
		),
		modelInfo.outputPrice !== undefined && modelInfo.outputPrice > 0 && (
			<>
				<span className="font-medium">输出价格：</span> {formatPrice(modelInfo.outputPrice)} / 百万令牌
			</>
		),
		modelInfo.supportsPromptCache && modelInfo.cacheReadsPrice && (
			<>
				<span className="font-medium">缓存读取价格：</span> {formatPrice(modelInfo.cacheReadsPrice || 0)} /
				百万令牌
			</>
		),
		modelInfo.supportsPromptCache && modelInfo.cacheWritesPrice && (
			<>
				<span className="font-medium">缓存写入价格：</span> {formatPrice(modelInfo.cacheWritesPrice || 0)}{" "}
				/ 百万令牌
			</>
		),
		isGemini && (
			<span className="italic">
				* 每分钟免费使用 {selectedModelId && selectedModelId.includes("flash") ? "15" : "2"} 次请求。
				超过后，费用取决于提示词大小。{" "}
				<VSCodeLink href="https://ai.google.dev/pricing" className="text-sm">
					更多信息，请查看价格详情。
				</VSCodeLink>
			</span>
		),
	].filter(Boolean)

	return (
		<>
			{modelInfo.description && (
				<ModelDescriptionMarkdown
					key="description"
					markdown={modelInfo.description}
					isExpanded={isDescriptionExpanded}
					setIsExpanded={setIsDescriptionExpanded}
				/>
			)}
			<div className="text-sm text-vscode-descriptionForeground">
				{infoItems.map((item, index) => (
					<div key={index}>{item}</div>
				))}
			</div>
		</>
	)
}

const ModelInfoSupportsItem = ({
	isSupported,
	supportsLabel,
	doesNotSupportLabel,
}: {
	isSupported: boolean
	supportsLabel: string
	doesNotSupportLabel: string
}) => (
	<div
		className={cn(
			"flex items-center gap-1 font-medium",
			isSupported ? "text-vscode-charts-green" : "text-vscode-errorForeground",
		)}>
		<span className={cn("codicon", isSupported ? "codicon-check" : "codicon-x")} />
		{isSupported ? supportsLabel : doesNotSupportLabel}
	</div>
)
