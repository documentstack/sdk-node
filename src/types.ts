/**
 * Configuration options for the DocumentStack client
 */
export interface DocumentStackConfig {
  /** API key for authentication (Bearer token) */
  apiKey: string;
  /** Base URL of the DocumentStack API (default: https://api.documentstack.dev) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom headers to include in all requests */
  headers?: Record<string, string>;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Options for PDF generation
 */
export interface GenerateOptions {
  /** Custom filename for the generated PDF (without .pdf extension) */
  filename?: string;
}

/**
 * Request payload for PDF generation
 */
export interface GenerateRequest {
  /** Template data for variable substitution */
  data?: Record<string, unknown>;
  /** Generation options */
  options?: GenerateOptions;
}

/**
 * Response metadata from PDF generation
 */
export interface GenerateResponse {
  /** PDF binary data as Buffer */
  pdf: Buffer;
  /** Filename from Content-Disposition header */
  filename: string;
  /** Generation time in milliseconds */
  generationTimeMs: number;
  /** Content length in bytes */
  contentLength: number;
}

/**
 * Error response from the API
 */
export interface APIErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}
