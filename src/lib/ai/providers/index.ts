/**
 * AI Providers Export Index
 */
export { OpenAIProvider } from "./openai";
export { AnthropicProvider } from "./anthropic";
export { GeminiProvider } from "./gemini";
export { aiProviderRegistry, AIProviderRegistry } from "./registry";
export type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  AIProviderConfig,
} from "./types";

// Import registry for convenience functions
import { aiProviderRegistry } from "./registry";

// Convenience function to get the current active provider
export function getAIProvider(providerName?: string) {
  return aiProviderRegistry.getProvider(providerName);
}

// Convenience function to create completion with active provider
export async function createAICompletion(
  messages: import("./types").AIMessage[],
  options?: import("./types").AICompletionOptions,
  providerName?: string,
) {
  const provider = getAIProvider(providerName);
  return provider.createCompletion(messages, options);
}
