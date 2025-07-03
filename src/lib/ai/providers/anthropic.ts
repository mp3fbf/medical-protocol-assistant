/**
 * Anthropic Provider Implementation
 */
import Anthropic from "@anthropic-ai/sdk";
import type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
} from "./types";

export class AnthropicProvider implements AIProvider {
  name = "anthropic";
  private client: Anthropic;
  private defaultModel = "claude-3-5-sonnet-20241022";
  private supportedModels = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ];

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      // MAXIMUM TIMEOUT FOR O3-LIKE TESTING
      timeout: 604800000, // 7 days
      maxRetries: 0, // No retries
      // Custom fetch with maximum timeout
      fetch: (url: any, init: any) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 604800000); // 7 days

        return fetch(url, {
          ...init,
          signal: controller.signal,
          keepalive: true,
        }).finally(() => clearTimeout(timeoutId));
      },
    });
  }

  async createCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): Promise<AICompletionResponse> {
    // Anthropic requires system message to be separate
    const systemMessage = messages.find((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");

    const response = await this.client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.max_tokens || 4096,
      temperature: options?.temperature,
      system: systemMessage?.content,
      messages: conversationMessages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Anthropic returned non-text response");
    }

    return {
      content: content.text,
      usage: response.usage
        ? {
            prompt_tokens: response.usage.input_tokens,
            completion_tokens: response.usage.output_tokens,
            total_tokens:
              response.usage.input_tokens + response.usage.output_tokens,
          }
        : undefined,
      model: response.model,
      finish_reason: response.stop_reason || undefined,
    };
  }

  isConfigured(): boolean {
    return !!(process.env.ANTHROPIC_API_KEY || this.client.apiKey);
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
