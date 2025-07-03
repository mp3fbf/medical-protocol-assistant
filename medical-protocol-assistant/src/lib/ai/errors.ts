/**
 * AI-Specific Error Handling
 *
 * This file defines custom error classes for issues originating from AI services.
 */

export class AIError extends Error {
  public readonly cause?: Error;
  public readonly service?: string;

  constructor(message: string, options?: { cause?: Error; service?: string }) {
    super(message);
    this.name = this.constructor.name;
    this.cause = options?.cause;
    this.service = options?.service;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}

export class OpenAIError extends AIError {
  public readonly statusCode?: number;
  public readonly errorType?: string;

  constructor(
    message: string,
    options?: {
      cause?: Error;
      statusCode?: number;
      errorType?: string;
    },
  ) {
    super(message, { cause: options?.cause, service: "OpenAI" });
    this.name = this.constructor.name;
    this.statusCode = options?.statusCode;
    this.errorType = options?.errorType;
  }
}

export class DeepResearchError extends AIError {
  public readonly statusCode?: number;

  constructor(
    message: string,
    options?: { cause?: Error; statusCode?: number },
  ) {
    super(message, { cause: options?.cause, service: "DeepResearch" });
    this.name = this.constructor.name;
    this.statusCode = options?.statusCode;
  }
}

// Add other AI service-specific errors as needed
// e.g., class AnthropicError extends AIError { ... }
