export const EXPERIMENT_IDS = {
	DIFF_STRATEGY: "experimentalDiffStrategy",
	SEARCH_AND_REPLACE: "search_and_replace",
	INSERT_BLOCK: "insert_content",
	POWER_STEERING: "powerSteering",
	MULTI_SEARCH_AND_REPLACE: "multi_search_and_replace",
} as const

export type ExperimentKey = keyof typeof EXPERIMENT_IDS
export type ExperimentId = valueof<typeof EXPERIMENT_IDS>

export interface ExperimentConfig {
	name: string
	description: string
	enabled: boolean
}

type valueof<X> = X[keyof X]

export const experimentConfigsMap: Record<ExperimentKey, ExperimentConfig> = {
	DIFF_STRATEGY: {
		name: "使用实验性统一差异策略",
		description:
			"启用实验性统一差异策略。此策略可能会减少由于模型错误导致的重试次数，但可能会导致意外行为或不正确的编辑。仅在您理解风险并愿意仔细审查所有更改时启用。",
		enabled: false,
	},
	SEARCH_AND_REPLACE: {
		name: "使用实验性搜索和替换工具",
		description:
			"启用实验性搜索和替换工具，允许Magic在一次请求中替换多个搜索词的实例。",
		enabled: false,
	},
	INSERT_BLOCK: {
		name: "使用实验性插入内容工具",

		description:
			"启用实验性插入内容工具，允许Magic在不需要创建差异的情况下在特定行号插入内容。",
		enabled: false,
	},
	POWER_STEERING: {
		name: '使用实验性的“动力转向”模式',
		description:
			"当启用时，Magic会频繁提醒模型关于其当前模式定义的细节。这将导致更强的角色定义和自定义指令遵循，但每条消息会使用更多令牌。",
		enabled: false,
	},
	MULTI_SEARCH_AND_REPLACE: {
		name: "使用实验性多块差异工具",
		description:
			"当启用时，Magic将使用多块差异工具。这将尝试在一次请求中更新文件中的多个代码块。",
		enabled: false,
	},
}

export const experimentDefault = Object.fromEntries(
	Object.entries(experimentConfigsMap).map(([_, config]) => [
		EXPERIMENT_IDS[_ as keyof typeof EXPERIMENT_IDS] as ExperimentId,
		config.enabled,
	]),
) as Record<ExperimentId, boolean>

export const experiments = {
	get: (id: ExperimentKey): ExperimentConfig | undefined => {
		return experimentConfigsMap[id]
	},
	isEnabled: (experimentsConfig: Record<ExperimentId, boolean>, id: ExperimentId): boolean => {
		return experimentsConfig[id] ?? experimentDefault[id]
	},
} as const

// Expose experiment details for UI - pre-compute from map for better performance
export const experimentLabels = Object.fromEntries(
	Object.entries(experimentConfigsMap).map(([_, config]) => [
		EXPERIMENT_IDS[_ as keyof typeof EXPERIMENT_IDS] as ExperimentId,
		config.name,
	]),
) as Record<string, string>

export const experimentDescriptions = Object.fromEntries(
	Object.entries(experimentConfigsMap).map(([_, config]) => [
		EXPERIMENT_IDS[_ as keyof typeof EXPERIMENT_IDS] as ExperimentId,
		config.description,
	]),
) as Record<string, string>
