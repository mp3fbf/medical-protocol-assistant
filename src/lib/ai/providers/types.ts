/**
 * Common types for AI model providers abstraction
 */

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
  model?: string;
}

export interface AICompletionResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  finish_reason?: string;
}

export interface AIProvider {
  name: string;
  createCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions,
  ): Promise<AICompletionResponse>;
  isConfigured(): boolean;
  getDefaultModel(): string;
  getSupportedModels(): string[];
}

export interface AIProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
  supportedModels: string[];
  enabled: boolean;
}
