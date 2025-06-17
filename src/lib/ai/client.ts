/**
 * AI Client - Unified interface using provider abstraction
 *
 * This module provides both new abstracted AI functions and legacy OpenAI functions
 * for backward compatibility during migration.
 */
import OpenAI from "openai";
import { OPENAI_API_TIMEOUT_MS } from "./config";
import { OpenAIError } from "./errors";
import type {
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
} from "./providers/types";
import { createAICompletion } from "./providers";

let openaiInstance: OpenAI | null = null;

/**
 * Retrieves the singleton OpenAI client instance.
 * Throws an error if the OpenAI API key is not configured (except in test environment).
 * @returns The configured OpenAI client.
 * @throws {OpenAIError} If the API key is missing in non-test environments.
 */
export function getOpenAIClient(): OpenAI {
  if (openaiInstance) {
    return openaiInstance;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const organizationId = process.env.OPENAI_ORG_ID || undefined;

  if (!apiKey && process.env.NODE_ENV !== "test") {
    console.error(
      "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.",
    );
    throw new OpenAIError(
      "OpenAI API key is missing. Configure OPENAI_API_KEY environment variable.",
    );
  }

  try {
    // For test environment, apiKey might be undefined if mocks are used at a higher level.
    // The OpenAI constructor can handle an undefined apiKey, leading to errors only if an actual API call is made.
    // This is acceptable as tests should mock the API calls themselves.
    openaiInstance = new OpenAI({
      apiKey: apiKey || "sk-test-key-if-not-set-for-constructor", // Provide a dummy key for constructor if testing and not set
      organization: organizationId,
      timeout: OPENAI_API_TIMEOUT_MS, // Now 7 DAYS from config
      maxRetries: 0, // NO RETRIES for O3 testing
      httpAgent: new (require("https").Agent)({
        keepAlive: true,
        keepAliveMsecs: 30000,
        timeout: 604800000, // 7 DAYS
      }),
      defaultHeaders: {
        Connection: "keep-alive",
        "Keep-Alive": "timeout=86400, max=1000",
      },
    });
    return openaiInstance;
  } catch (error) {
    console.error("Failed to initialize OpenAI client:", error);
    if (error instanceof Error) {
      throw new OpenAIError(
        `Failed to initialize OpenAI client: ${error.message}`,
        { cause: error },
      );
    }
    throw new OpenAIError(
      "An unknown error occurred while initializing OpenAI client.",
    );
  }
}

/**
 * NEW: Unified chat completion function using provider abstraction
 *
 * @param model The AI model to use (depends on active provider)
 * @param messages The array of messages for the chat completion
 * @param options Additional options for the chat completion
 * @returns The AI completion response (provider-agnostic)
 * @throws {OpenAIError} If the API call fails
 */
export async function createChatCompletion(
  model: string,
  messages: AIMessage[],
  options?: AICompletionOptions,
): Promise<AICompletionResponse> {
  try {
    return await createAICompletion(messages, {
      model,
      ...options,
    });
  } catch (error: any) {
    console.error("AI API request failed:", error);
    throw new OpenAIError(
      `AI API request failed: ${error.message || "Unknown error"}`,
      { cause: error },
    );
  }
}

/**
 * LEGACY: OpenAI-specific chat completion function
 * @deprecated Use createChatCompletion with AIMessage[] instead
 *
 * @param model The OpenAI model to use (e.g., "gpt-4-turbo-preview")
 * @param messages The array of messages for the chat completion
 * @param options Additional options for the chat completion
 * @returns The OpenAI chat completion response
 * @throws {OpenAIError} If the API call fails
 */
export async function createLegacyChatCompletion(
  model: string,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming>,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const client = getOpenAIClient();
  try {
    const completion = await client.chat.completions.create({
      model,
      messages,
      ...options,
    });
    return completion;
  } catch (error: any) {
    console.error("OpenAI API request failed:", error);
    if (
      process.env.NODE_ENV === "test" &&
      !process.env.OPENAI_API_KEY &&
      error.message?.includes("api_key_required")
    ) {
      throw new OpenAIError(
        "OpenAI API call attempted in test without API key and without being mocked. Ensure API calls are mocked in tests.",
        { cause: error, statusCode: error.status, errorType: error.type },
      );
    }
    throw new OpenAIError(
      `OpenAI API request failed: ${error.message || "Unknown error"}`,
      {
        cause: error,
        statusCode: error.status,
        errorType: error.type,
      },
    );
  }
}

// You can add more specific client interaction functions here as needed,
// for example, for embeddings, fine-tuning, etc.
