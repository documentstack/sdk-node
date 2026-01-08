import type {
  DocumentStackConfig,
  GenerateRequest,
  GenerateResponse,
  APIErrorResponse,
} from "./types";
import {
  APIError,
  AuthenticationError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  ValidationError,
} from "./errors";

const DEFAULT_BASE_URL = "https://api.documentstack.dev";
const DEFAULT_TIMEOUT = 30000;

/**
 * DocumentStack API client for PDF generation
 *
 * @example
 * ```typescript
 * import { DocumentStack } from '@documentstack/sdk';
 *
 * const client = new DocumentStack({
 *   apiKey: 'your-api-key',
 * });
 *
 * const result = await client.generate('template-id', {
 *   data: { name: 'John Doe', amount: 100 },
 *   options: { filename: 'invoice' },
 * });
 *
 * // Save to file
 * fs.writeFileSync('invoice.pdf', result.pdf);
 * ```
 */
export class DocumentStack {
  private readonly config: Required<
    Omit<DocumentStackConfig, "headers" | "debug">
  > &
    Pick<DocumentStackConfig, "headers" | "debug">;

  constructor(config: DocumentStackConfig) {
    if (!config.apiKey) {
      throw new Error("API key is required");
    }

    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl?.replace(/\/$/, "") || DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      headers: config.headers,
      debug: config.debug,
    };
  }

  /**
   * Generate a PDF from a template
   *
   * @param templateId - The ID of the template to use
   * @param request - Generation request with data and options
   * @returns Promise resolving to the generated PDF and metadata
   * @throws {ValidationError} When request body is invalid
   * @throws {AuthenticationError} When API key is invalid
   * @throws {ForbiddenError} When access to template is forbidden
   * @throws {NotFoundError} When template is not found
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {ServerError} When server encounters an error
   * @throws {TimeoutError} When request times out
   * @throws {NetworkError} When network request fails
   */
  async generate(
    templateId: string,
    request: GenerateRequest = {}
  ): Promise<GenerateResponse> {
    if (!templateId) {
      throw new ValidationError({
        error: "Bad Request",
        message: "Template ID is required",
      });
    }

    const url = `${this.config.baseUrl}/api/v1/generate/${encodeURIComponent(templateId)}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
      ...this.config.headers,
    };

    const body = JSON.stringify({
      data: request.data,
      options: request.options,
    });

    if (this.config.debug) {
      console.log("[DocumentStack] Request:", {
        url,
        headers: { ...headers, Authorization: "Bearer ***" },
        body,
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({
          error: "Unknown Error",
          message: response.statusText,
        }))) as APIErrorResponse;

        throw this.createError(response.status, errorBody, response.headers);
      }

      const pdf = Buffer.from(await response.arrayBuffer());
      const contentDisposition = response.headers.get("Content-Disposition") || "";
      const generationTimeMs = parseInt(
        response.headers.get("X-Generation-Time-Ms") || "0",
        10
      );
      const contentLength = parseInt(
        response.headers.get("Content-Length") || "0",
        10
      );

      // Extract filename from Content-Disposition header
      const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
      const filename = filenameMatch?.[1] || "document.pdf";

      if (this.config.debug) {
        console.log("[DocumentStack] Response:", {
          filename,
          generationTimeMs,
          contentLength,
        });
      }

      return {
        pdf,
        filename: decodeURIComponent(filename),
        generationTimeMs,
        contentLength: contentLength || pdf.length,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new TimeoutError(this.config.timeout);
        }
        throw new NetworkError(`Network request failed: ${error.message}`, error);
      }

      throw new NetworkError("Unknown network error");
    }
  }

  private createError(
    statusCode: number,
    response: APIErrorResponse,
    headers: Headers
  ): APIError {
    switch (statusCode) {
      case 400:
        return new ValidationError(response);
      case 401:
        return new AuthenticationError(response);
      case 403:
        return new ForbiddenError(response);
      case 404:
        return new NotFoundError(response);
      case 429: {
        const retryAfter =
          parseInt(headers.get("Retry-After") || "", 10) || undefined;
        return new RateLimitError(response, retryAfter);
      }
      case 500:
      default:
        return new ServerError(response);
    }
  }
}
