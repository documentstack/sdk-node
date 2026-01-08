import type { APIErrorResponse } from "./types";

/**
 * Base error class for all DocumentStack SDK errors
 */
export class DocumentStackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentStackError";
  }
}

/**
 * Error thrown when API request fails with a specific HTTP status
 */
export class APIError extends DocumentStackError {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly details?: unknown;

  constructor(statusCode: number, response: APIErrorResponse) {
    super(response.message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.errorCode = response.error;
    this.details = response.details;
  }

  static isAPIError(error: unknown): error is APIError {
    return error instanceof APIError;
  }
}

/**
 * Error thrown when request validation fails (400)
 */
export class ValidationError extends APIError {
  constructor(response: APIErrorResponse) {
    super(400, response);
    this.name = "ValidationError";
  }
}

/**
 * Error thrown when authentication fails (401)
 */
export class AuthenticationError extends APIError {
  constructor(response: APIErrorResponse) {
    super(401, response);
    this.name = "AuthenticationError";
  }
}

/**
 * Error thrown when access is forbidden (403)
 */
export class ForbiddenError extends APIError {
  constructor(response: APIErrorResponse) {
    super(403, response);
    this.name = "ForbiddenError";
  }
}

/**
 * Error thrown when template is not found (404)
 */
export class NotFoundError extends APIError {
  constructor(response: APIErrorResponse) {
    super(404, response);
    this.name = "NotFoundError";
  }
}

/**
 * Error thrown when rate limit is exceeded (429)
 */
export class RateLimitError extends APIError {
  readonly retryAfter?: number;

  constructor(response: APIErrorResponse, retryAfter?: number) {
    super(429, response);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when server encounters an error (500)
 */
export class ServerError extends APIError {
  constructor(response: APIErrorResponse) {
    super(500, response);
    this.name = "ServerError";
  }
}

/**
 * Error thrown when request times out
 */
export class TimeoutError extends DocumentStackError {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = "TimeoutError";
  }
}

/**
 * Error thrown when network request fails
 */
export class NetworkError extends DocumentStackError {
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "NetworkError";
    this.cause = cause;
  }
}
