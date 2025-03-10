import { OpenAiHandler, OpenAiHandlerOptions } from "./openai"
import { qwqModels, qwqDefaultModelId, ModelInfo } from "../../shared/api"
import { ApiStreamUsageChunk } from "../transform/stream"
import { getModelParams } from "../index"

/**
 * QWQ模型处理器 - 基于OpenAI格式，为QWQ32B模型提供支持
 */
export class QwqHandler extends OpenAiHandler {
	constructor(options: OpenAiHandlerOptions) {
		super({
			...options,
			openAiApiKey: options.qwqApiKey ?? "not-provided",
			openAiModelId: options.qwqModelId ?? options.apiModelId ?? qwqDefaultModelId,
			openAiBaseUrl: options.qwqBaseUrl ?? "https://api.example.com/qwq", // 替换为实际API端点
			openAiStreamingEnabled: true,
			includeMaxTokens: true,
		})
	}

	override getModel(): { id: string; info: ModelInfo } {
		const modelId = this.options.qwqModelId ?? this.options.apiModelId ?? qwqDefaultModelId
		const info = qwqModels[modelId as keyof typeof qwqModels] || qwqModels[qwqDefaultModelId]

		return {
			id: modelId,
			info,
			...getModelParams({ options: this.options, model: info }),
		}
	}

	// 如果QWQ有特殊的使用指标处理需求，可以覆盖此方法
	protected override processUsageMetrics(usage: any): ApiStreamUsageChunk {
		return {
			type: "usage",
			inputTokens: usage?.prompt_tokens || 0,
			outputTokens: usage?.completion_tokens || 0,
		}
	}
}
