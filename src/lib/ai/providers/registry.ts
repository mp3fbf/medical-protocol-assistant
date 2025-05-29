/**
 * AI Provider Registry and Factory
 * Manages available AI providers and allows easy switching
 */
import type { AIProvider, AIProviderConfig } from "./types";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";

export class AIProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();
  private configs: Map<string, AIProviderConfig> = new Map();
  private activeProvider: string = "openai"; // Default provider

  constructor() {
    this.initializeDefaultProviders();
  }

  private initializeDefaultProviders(): void {
    // Register OpenAI
    const openaiConfig: AIProviderConfig = {
      name: "openai",
      defaultModel: "gpt-4o-mini",
      supportedModels: [
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4-turbo",
        "gpt-4",
        "gpt-3.5-turbo",
      ],
      enabled: !!process.env.OPENAI_API_KEY,
    };
    this.configs.set("openai", openaiConfig);

    // Register Anthropic
    const anthropicConfig: AIProviderConfig = {
      name: "anthropic",
      defaultModel: "claude-3-5-sonnet-20241022",
      supportedModels: [
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
      ],
      enabled: !!process.env.ANTHROPIC_API_KEY,
    };
    this.configs.set("anthropic", anthropicConfig);

    // Register Gemini
    const geminiConfig: AIProviderConfig = {
      name: "gemini",
      defaultModel: "gemini-1.5-pro",
      supportedModels: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
      enabled: !!process.env.GOOGLE_AI_API_KEY,
    };
    this.configs.set("gemini", geminiConfig);

    // Set active provider to first available
    if (openaiConfig.enabled) {
      this.activeProvider = "openai";
    } else if (anthropicConfig.enabled) {
      this.activeProvider = "anthropic";
    } else if (geminiConfig.enabled) {
      this.activeProvider = "gemini";
    }
  }

  getProvider(name?: string): AIProvider {
    const providerName = name || this.activeProvider;

    if (!this.providers.has(providerName)) {
      const config = this.configs.get(providerName);
      if (!config || !config.enabled) {
        throw new Error(
          `Provider '${providerName}' is not available or configured`,
        );
      }

      const provider = this.createProvider(providerName);
      this.providers.set(providerName, provider);
    }

    return this.providers.get(providerName)!;
  }

  private createProvider(name: string): AIProvider {
    try {
      switch (name) {
        case "openai":
          return new OpenAIProvider();
        case "anthropic":
          return new AnthropicProvider();
        case "gemini":
          return new GeminiProvider();
        default:
          throw new Error(`Unknown provider: ${name}`);
      }
    } catch (error) {
      console.error(`Failed to create provider ${name}:`, error);
      throw new Error(
        `Provider ${name} is not available: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  setActiveProvider(name: string): void {
    const config = this.configs.get(name);
    if (!config) {
      throw new Error(`Provider '${name}' is not registered`);
    }
    if (!config.enabled) {
      throw new Error(`Provider '${name}' is not enabled (missing API key)`);
    }
    this.activeProvider = name;
  }

  getActiveProvider(): string {
    return this.activeProvider;
  }

  getAvailableProviders(): AIProviderConfig[] {
    return Array.from(this.configs.values()).filter((config) => config.enabled);
  }

  getAllProviders(): AIProviderConfig[] {
    return Array.from(this.configs.values());
  }

  isProviderAvailable(name: string): boolean {
    const config = this.configs.get(name);
    return config ? config.enabled : false;
  }

  registerProvider(
    name: string,
    provider: AIProvider,
    config: AIProviderConfig,
  ): void {
    this.providers.set(name, provider);
    this.configs.set(name, config);
  }
}

// Global registry instance
export const aiProviderRegistry = new AIProviderRegistry();
