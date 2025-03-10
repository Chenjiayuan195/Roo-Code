import { OpenAiHandler, OpenAiHandlerOptions } from "./openai"
import { deepSeekModels, deepSeekDefaultModelId, ModelInfo } from "../../shared/api"
import { ApiStreamUsageChunk } from "../transform/stream" // Import for type
import { getModelParams } from "../index"
import { convertToSimpleMessages } from "../transform/simple-format"
import { Anthropic } from "@anthropic-ai/sdk"

export class DeepSeekHandler extends OpenAiHandler {
	private isR1Model: boolean

	constructor(options: OpenAiHandlerOptions) {
		super({
			...options,
			openAiApiKey: options.deepSeekApiKey ?? "not-provided",
			openAiModelId: options.apiModelId ?? deepSeekDefaultModelId,
			openAiBaseUrl: options.deepSeekBaseUrl ?? "https://api.deepseek.com",
			openAiStreamingEnabled: true,
			includeMaxTokens: true,
		})

		// 检查是否是R1模型，设置特殊处理标志
		this.isR1Model = options.apiModelId === "deepseek-reasoner"
	}

	override getModel(): { id: string; info: ModelInfo } {
		const modelId = this.options.apiModelId ?? deepSeekDefaultModelId
		const info = deepSeekModels[modelId as keyof typeof deepSeekModels] || deepSeekModels[deepSeekDefaultModelId]

		return {
			id: modelId,
			info,
			...getModelParams({ options: this.options, model: info }),
		}
	}

	// Override to handle DeepSeek's usage metrics, including caching.
	protected override processUsageMetrics(usage: any): ApiStreamUsageChunk {
		return {
			type: "usage",
			inputTokens: usage?.prompt_tokens || 0,
			outputTokens: usage?.completion_tokens || 0,
			cacheWriteTokens: usage?.prompt_tokens_details?.cache_miss_tokens,
			cacheReadTokens: usage?.prompt_tokens_details?.cached_tokens,
		}
	}

	// 重写createMessage方法，为R1模型添加特殊处理
	override async *createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
	): AsyncGenerator<any> {
		// 如果是R1模型，使用特殊的参数
		if (this.isR1Model) {
			const options = {
				temperature: 0.7, // 适合推理的温度
				max_tokens: this.options.modelMaxTokens || 8192,
				// 为R1模型设置特殊参数
				presence_penalty: 0.1,
				frequency_penalty: 0.1,
			}

			// 使用常规方法处理流式响应
			const response = yield* super.createMessage(systemPrompt, messages)
			return response
		} else {
			// 对于非R1模型，使用默认行为
			return yield* super.createMessage(systemPrompt, messages)
		}
	}
}
