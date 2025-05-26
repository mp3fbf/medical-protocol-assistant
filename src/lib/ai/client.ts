/**
 * OpenAI Client Configuration
 *
 * This module configures and exports a singleton instance of the OpenAI client.
 * It handles API key management and provides a configured client for use
 * in other AI-related services.
 */
import OpenAI from "openai";
import { OPENAI_API_TIMEOUT_MS } from "./config";
import { OpenAIError } from "./errors";

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
      timeout: OPENAI_API_TIMEOUT_MS,
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
 * Example of a higher-level function to interact with OpenAI's chat completions.
 * This function is illustrative and might be moved or adapted in later steps.
 *
 * @param model The OpenAI model to use (e.g., "gpt-4-turbo-preview").
 * @param messages The array of messages for the chat completion.
 * @param options Additional options for the chat completion.
 * @returns The chat completion response.
 * @throws {OpenAIError} If the API call fails.
 */
export async function createChatCompletion(
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
    // Log the error and re-throw as a custom OpenAIError for better context
    console.error("OpenAI API request failed:", error);
    // Check if running in test environment and an API key was expected but missing for a real call
    if (
      process.env.NODE_ENV === "test" &&
      !process.env.OPENAI_API_KEY &&
      error.message?.includes("api_key_required") // Example error message check
    ) {
      // This indicates an unmocked API call in a test without an API key.
      // Tests should mock this specific call.
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
