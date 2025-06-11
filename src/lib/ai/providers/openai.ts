/**
 * OpenAI Provider Implementation
 */
import OpenAI from "openai";
import type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
} from "./types";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private client: OpenAI;
  private defaultModel = "gpt-4o-mini";
  private supportedModels = [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
    "o4-mini",
    "o3",
    "o3-mini",
  ];

  constructor(apiKey?: string, baseUrl?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      baseURL: baseUrl,
    });
  }

  async createCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): Promise<AICompletionResponse> {
    const model = options?.model || this.defaultModel;

    // Handle model-specific requirements
    const completionParams: any = {
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    };

    // Check if it's an O-series model (o3, o3-mini, o4-mini)
    const isOSeriesModel = model.startsWith("o3") || model === "o4-mini";

    if (isOSeriesModel) {
      // O-series models specific parameters
      completionParams.max_completion_tokens = options?.max_tokens;
      // O-series models only support temperature = 1 (default), so we omit it
      // They also don't support response_format

      // Explicitly set temperature to 1 for O3 models to ensure compliance
      if (model.startsWith("o3")) {
        completionParams.temperature = 1;
      }
    } else {
      // Standard parameters for other models
      completionParams.max_tokens = options?.max_tokens;
      completionParams.temperature = options?.temperature;
      completionParams.response_format = options?.response_format;
    }

    const response =
      await this.client.chat.completions.create(completionParams);

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error("OpenAI returned empty response");
    }

    return {
      content: choice.message.content,
      usage: response.usage
        ? {
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            total_tokens: response.usage.total_tokens,
          }
        : undefined,
      model: response.model,
      finish_reason: choice.finish_reason || undefined,
    };
  }

  isConfigured(): boolean {
    return !!(process.env.OPENAI_API_KEY || this.client.apiKey);
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  setDefaultModel(model: string): void {
    if (!this.supportedModels.includes(model)) {
      throw new Error(`Unsupported model: ${model}`);
    }
    this.defaultModel = model;
  }
}
