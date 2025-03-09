import { useMemo, useState, useCallback, useEffect, useRef } from "react"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { cn } from "@/lib/utils"

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem } from "@/components/ui/combobox"

import { ApiConfiguration, ModelInfo } from "../../../../src/shared/api"

import { normalizeApiConfiguration } from "./ApiOptions"
import { ThinkingBudget } from "./ThinkingBudget"
import { ModelInfoView } from "./ModelInfoView"

type ExtractType<T> = NonNullable<
	{ [K in keyof ApiConfiguration]: Required<ApiConfiguration>[K] extends T ? K : never }[keyof ApiConfiguration]
>

type ModelIdKeys = NonNullable<
	{ [K in keyof ApiConfiguration]: K extends `${string}ModelId` ? K : never }[keyof ApiConfiguration]
>

interface ModelPickerProps {
	defaultModelId: string
	defaultModelInfo?: ModelInfo
	models: Record<string, ModelInfo> | null
	modelIdKey: ModelIdKeys
	modelInfoKey: ExtractType<ModelInfo>
	serviceName: string
	serviceUrl: string
	apiConfiguration: ApiConfiguration
	setApiConfigurationField: <K extends keyof ApiConfiguration>(field: K, value: ApiConfiguration[K]) => void
	showOpenRouterInfo: boolean
}

export const ModelPicker = ({
	defaultModelId,
	models,
	modelIdKey,
	modelInfoKey,
	serviceName,
	serviceUrl,
	apiConfiguration,
	setApiConfigurationField,
	defaultModelInfo,
	showOpenRouterInfo,
}: ModelPickerProps) => {
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
	const isInitialized = useRef(false)

	const modelIds = useMemo(() => Object.keys(models ?? {}).sort((a, b) => a.localeCompare(b)), [models])

	const { selectedModelId, selectedModelInfo } = useMemo(
		() => normalizeApiConfiguration(apiConfiguration),
		[apiConfiguration],
	)

	const onSelect = useCallback(
		(modelId: string) => {
			const modelInfo = models?.[modelId]
			setApiConfigurationField(modelIdKey, modelId)
			setApiConfigurationField(modelInfoKey, modelInfo ?? defaultModelInfo)
		},
		[modelIdKey, modelInfoKey, models, setApiConfigurationField, defaultModelInfo],
	)

	const inputValue = apiConfiguration[modelIdKey]

	useEffect(() => {
		if (!inputValue && !isInitialized.current) {
			const initialValue = modelIds.includes(selectedModelId) ? selectedModelId : defaultModelId
			setApiConfigurationField(modelIdKey, initialValue)
		}

		isInitialized.current = true
	}, [inputValue, modelIds, setApiConfigurationField, modelIdKey, selectedModelId, defaultModelId])

	return (
		<>
			<div>
				<div className="font-medium">Model</div>
				<Combobox type="single" inputValue={inputValue} onInputValueChange={onSelect}>
					<ComboboxInput placeholder="Search model..." data-testid="model-input" />
					<ComboboxContent>
						<ComboboxEmpty>No model found.</ComboboxEmpty>
						{modelIds.map((model) => (
							<ComboboxItem key={model} value={model}>
								{model}
							</ComboboxItem>
						))}
					</ComboboxContent>
				</Combobox>
			</div>
			{selectedModelId && selectedModelInfo && selectedModelId === inputValue && (
				<ModelInfoView
					selectedModelId={selectedModelId}
					modelInfo={selectedModelInfo}
					isDescriptionExpanded={isDescriptionExpanded}
					setIsDescriptionExpanded={setIsDescriptionExpanded}
				/>
			)}
			<ThinkingBudget
				apiConfiguration={apiConfiguration}
				setApiConfigurationField={setApiConfigurationField}
				modelInfo={selectedModelInfo}
			/>
			{/* Info message about the model used */}
			{showOpenRouterInfo && (
				<p
					id="model-auto-fetch-info"
					className={cn(
						"text-xs text-vscode-descriptionForeground mt-2",
						models && Object.keys(models).length === 0 ? "opacity-100" : "",
					)}>
					此扩展会自动获取最新的可用模型列表，来自{" "}
					<VSCodeLink href="https://openrouter.ai">OpenRouter</VSCodeLink>
					。如果您不确定选择哪个模型，Magic Code最适合与
					<VSCodeLink href="https://anthropic.com/claude">
						<strong>anthropic/claude-3.7-sonnet</strong>
					</VSCodeLink>
					配合使用。您也可以尝试搜索"free"来查找当前可用的免费选项。
				</p>
			)}
		</>
	)
}
