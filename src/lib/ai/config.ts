/**
 * AI Model Configuration and Limits
 *
 * This file stores constants related to AI model names,
 * default parameters, and any operational limits.
 */

// OpenAI Model Names
export const GPT_4_TURBO_PREVIEW = "gpt-4-turbo-preview"; // 128k context window
export const GPT_4_TURBO = "gpt-4-turbo"; // 128k context window
export const GPT_4_OMNI = "gpt-4o"; // 30k token limit for free tier
export const GPT_4_OMNI_MINI = "gpt-4o-mini"; // Lower cost alternative
export const O3 = "o3"; // O3 model - advanced reasoning (released April 2025)
export const O3_MINI = "o3-mini"; // O3 mini model - faster reasoning
export const O4_MINI = "o4-mini"; // O4 mini model - advanced reasoning
export const GPT_4 = "gpt-4";
export const GPT_3_5_TURBO = "gpt-3.5-turbo";

// Default Model Selections
export const DEFAULT_CHAT_MODEL = O3; // Primary model for chat/generation tasks - using O3 for better reasoning
export const DEFAULT_LARGE_CONTEXT_MODEL = O3; // For large documents - O3 has better context handling
export const DEFAULT_RESEARCH_ASSISTANT_MODEL = O3; // Model for research summarization/extraction

// Default Parameters
export const DEFAULT_TEMPERATURE = 0.3; // Lower for more deterministic, factual outputs
export const DEFAULT_MAX_TOKENS_PROTOCOL_GENERATION = 8000; // Max tokens for full protocol generation
export const DEFAULT_MAX_TOKENS_SECTION_GENERATION = 2000; // Max tokens for single section generation
export const DEFAULT_MAX_TOKENS_RESEARCH_SUMMARY = 4000; // Max tokens for research summarization

// Response Format
export const JSON_RESPONSE_FORMAT = { type: "json_object" } as const;

// API Timeouts (in milliseconds)
export const OPENAI_API_TIMEOUT_MS = 60000; // 60 seconds
export const DEEPRESEARCH_API_TIMEOUT_MS = 45000; // 45 seconds

// Retry Configuration (example)
export const DEFAULT_API_RETRY_ATTEMPTS = 3;
export const DEFAULT_API_RETRY_DELAY_MS = 1000;

// Token limits per model (approximate)
export const MODEL_TOKEN_LIMITS = {
  [GPT_4_TURBO]: 128000,
  [GPT_4_TURBO_PREVIEW]: 128000,
  [GPT_4_OMNI]: 30000, // Free tier limit
  [GPT_4_OMNI_MINI]: 128000,
  [O3]: 200000, // O3 has larger context window for complex reasoning
  [O3_MINI]: 100000, // O3 mini context window
  [O4_MINI]: 128000,
  [GPT_4]: 8192,
  [GPT_3_5_TURBO]: 16385,
} as const;

// Document size thresholds
export const LARGE_DOCUMENT_THRESHOLD = 25000; // tokens
