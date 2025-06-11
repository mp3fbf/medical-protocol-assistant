/**
 * OpenAI Provider Implementation
 */
import OpenAI from "openai";
import https from "https";
import type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
} from "./types";

// Timeout configurations for different request types
const TIMEOUT_CONFIGS = {
  standard: 3600000, // 1 hour for standard requests
  large: 7200000, // 2 hours for large context requests
  o3: 86400000, // 24 HOURS for O3 model requests
  research: 3600000, // 1 hour for research requests
};

// Retry configuration - DISABLED FOR O3 TESTING
const RETRY_CONFIG = {
  maxRetries: 1, // NO RETRIES - let it run once forever
  initialDelay: 1000, // 1 second
  maxDelay: 32000, // 32 seconds
  backoffMultiplier: 2,
};

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
  private retryDelays = new Map<string, number>();

  constructor(apiKey?: string, baseUrl?: string) {
    // Create HTTPS agent with keep-alive for better connection stability
    // Note: Don't set timeout here as it will be set per request
    const httpAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 30000, // 30 seconds
      // timeout removed - will be set dynamically per request
    });

    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      baseURL: baseUrl,
      timeout: 86400000, // 24 HOURS default for O3 testing
      maxRetries: 0, // We'll handle retries ourselves
      httpAgent: httpAgent,
    });
  }

  /**
   * Determine the appropriate timeout based on request type
   */
  private getRequestTimeout(
    model: string,
    options?: AICompletionOptions,
  ): number {
    // O3 models need more time
    if (model.startsWith("o3")) {
      return TIMEOUT_CONFIGS.o3;
    }

    // Large context requests
    if (options?.max_tokens && options.max_tokens > 4000) {
      return TIMEOUT_CONFIGS.large;
    }

    // Research requests (if we add a flag later)
    // if (options?.isResearch) return TIMEOUT_CONFIGS.research;

    return TIMEOUT_CONFIGS.standard;
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateBackoffDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      RETRY_CONFIG.initialDelay *
        Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
      RETRY_CONFIG.maxDelay,
    );
    // Add jitter (±25%)
    const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
    return Math.round(exponentialDelay + jitter);
  }

  /**
   * Check if error is retryable - DISABLED FOR O3 TESTING
   */
  private isRetryableError(error: any): boolean {
    // FOR O3 TESTING - NO RETRIES AT ALL
    return false;

    /* ORIGINAL CODE - DISABLED
    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }
    
    // OpenAI rate limits or server errors
    if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
      return true;
    }
    
    // Timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      return true;
    }
    
    // Context length errors are not retryable
    if (error.message?.includes('context_length_exceeded')) {
      return false;
    }
    
    // Quota errors are not retryable
    if (error.message?.includes('quota_exceeded')) {
      return false;
    }
    
    // Default to retryable for unknown errors
    return true;
    */
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
      stream: true, // ENABLE STREAMING FOR O3
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

    const timeout = this.getRequestTimeout(model, options);
    const requestId = `${model}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(
      `[OpenAI] Starting STREAMING request ${requestId} to ${model} at ${new Date().toISOString()}`,
    );
    console.log(
      `[OpenAI] Token limits: max_completion_tokens=${completionParams.max_completion_tokens || "UNLIMITED"}`,
    );
    console.log(
      `[OpenAI] Using streaming to keep connection alive during O3 processing`,
    );

    let lastError: any;

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      const startTime = Date.now();

      try {
        // Create a new HTTPS agent with aggressive keep-alive
        const requestAgent = new https.Agent({
          keepAlive: true,
          keepAliveMsecs: 10000, // Send keep-alive every 10 seconds
          // NO TIMEOUT - let the request run as long as needed
        });

        // Create a new client instance with INFINITE timeout
        const requestClient = new OpenAI({
          apiKey: this.client.apiKey,
          baseURL: this.client.baseURL,
          timeout: 86400000, // 24 HOURS - maximum timeout for O3
          maxRetries: 0,
          httpAgent: requestAgent,
        });

        // Create streaming completion
        const streamResponse =
          await requestClient.beta.chat.completions.stream(completionParams);

        // Collect all chunks
        let fullContent = "";
        let lastChunkTime = Date.now();
        let chunkCount = 0;

        console.log(`[OpenAI] Stream started for ${requestId}`);

        for await (const chunk of streamResponse) {
          const currentTime = Date.now();
          const timeSinceLastChunk = currentTime - lastChunkTime;
          lastChunkTime = currentTime;

          chunkCount++;

          // Log every 10th chunk to show progress
          if (chunkCount % 10 === 0) {
            console.log(
              `[OpenAI] Stream alive - chunk ${chunkCount}, ${timeSinceLastChunk}ms since last chunk`,
            );
          }

          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
          }
        }

        const duration = Date.now() - startTime;
        console.log(
          `[OpenAI] Stream completed for ${requestId} from ${model} after ${duration}ms (${chunkCount} chunks)`,
        );

        // Clear retry delay on success
        this.retryDelays.delete(requestId);

        if (!fullContent) {
          throw new Error("OpenAI returned empty response from stream");
        }

        return {
          content: fullContent,
          usage: undefined, // Streaming doesn't provide usage info for O3
          model: model,
          finish_reason: "stop",
        };
      } catch (error: any) {
        const duration = Date.now() - startTime;
        lastError = error;

        console.error(
          `[OpenAI] Stream request ${requestId} failed after ${duration}ms (attempt ${attempt}/${RETRY_CONFIG.maxRetries}):`,
          {
            model,
            error: error.message,
            code: error.code,
            type: error.type,
            status: error.status,
          },
        );

        // Check if we should retry
        if (attempt < RETRY_CONFIG.maxRetries && this.isRetryableError(error)) {
          const delay = this.calculateBackoffDelay(attempt);
          this.retryDelays.set(requestId, delay);

          console.log(
            `[OpenAI] Retrying request ${requestId} in ${delay}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})`,
          );

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // No more retries
          this.retryDelays.delete(requestId);
          break;
        }
      }
    }

    // All retries exhausted
    throw lastError;

    // This part is now handled inside the retry loop above
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
