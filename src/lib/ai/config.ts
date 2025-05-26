/**
 * AI Model Configuration and Limits
 *
 * This file stores constants related to AI model names,
 * default parameters, and any operational limits.
 */

// OpenAI Model Names
export const GPT_4_TURBO_PREVIEW = "gpt-4-turbo-preview"; // Alias for the latest GPT-4 Turbo with preview features
export const GPT_4_OMNI = "gpt-4o"; // Alias for the latest GPT-4 Omni model
export const GPT_4 = "gpt-4";
export const GPT_3_5_TURBO = "gpt-3.5-turbo";

// Default Model Selections
export const DEFAULT_CHAT_MODEL = GPT_4_OMNI; // Primary model for chat/generation tasks
export const DEFAULT_RESEARCH_ASSISTANT_MODEL = GPT_4_TURBO_PREVIEW; // Model for research summarization/extraction

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

// Other AI-related configurations can be added here
// e.g., context window sizes, specific prompt versioning flags, etc.
