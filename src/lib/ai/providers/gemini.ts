/**
 * Google Gemini Provider Implementation
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
} from "./types";

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private client: GoogleGenerativeAI;
  private defaultModel = "gemini-1.5-pro";
  private supportedModels = [
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
  ];

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_AI_API_KEY;
    if (!key) {
      throw new Error("Google AI API key is required");
    }
    this.client = new GoogleGenerativeAI(key);
  }

  async createCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): Promise<AICompletionResponse> {
    const model = this.client.getGenerativeModel({
      model: options?.model || this.defaultModel,
      generationConfig: {
        temperature: options?.temperature,
        maxOutputTokens: options?.max_tokens,
        ...(options?.response_format?.type === "json_object" && {
          responseMimeType: "application/json",
        }),
      },
    });

    // Convert messages to Gemini format
    const systemMessage = messages.find((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");

    // Build prompt with system instruction
    let prompt = "";
    if (systemMessage) {
      prompt += `${systemMessage.content}\n\n`;
    }

    // Add conversation history
    conversationMessages.forEach((msg) => {
      if (msg.role === "user") {
        prompt += `User: ${msg.content}\n`;
      } else if (msg.role === "assistant") {
        prompt += `Assistant: ${msg.content}\n`;
      }
    });

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Gemini returned empty response");
      }

      return {
        content: text,
        usage: response.usageMetadata
          ? {
              prompt_tokens: response.usageMetadata.promptTokenCount || 0,
              completion_tokens:
                response.usageMetadata.candidatesTokenCount || 0,
              total_tokens: response.usageMetadata.totalTokenCount || 0,
            }
          : undefined,
        model: options?.model || this.defaultModel,
        finish_reason: response.candidates?.[0]?.finishReason || undefined,
      };
    } catch (error: any) {
      console.error("Gemini API call failed:", error);
      throw new Error(
        `Gemini API call failed: ${error.message || "Unknown error"}`,
      );
    }
  }

  isConfigured(): boolean {
    return !!process.env.GOOGLE_AI_API_KEY;
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
