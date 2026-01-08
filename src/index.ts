// Main client
export { DocumentStack } from "./client";

// Types
export type {
  DocumentStackConfig,
  GenerateOptions,
  GenerateRequest,
  GenerateResponse,
  APIErrorResponse,
} from "./types";

// Errors
export {
  DocumentStackError,
  APIError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  NetworkError,
} from "./errors";
