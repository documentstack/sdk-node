# @documentstack/sdk

Official Node.js/TypeScript SDK for the DocumentStack PDF generation API.

## Installation

```bash
npm install @documentstack/sdk
# or
pnpm add @documentstack/sdk
# or
yarn add @documentstack/sdk
```

## Quick Start

```typescript
import { DocumentStack } from "@documentstack/sdk";
import fs from "fs";

// Initialize the client
const client = new DocumentStack({
  apiKey: "your-api-key",
});

// Generate a PDF
const result = await client.generate("template-id", {
  data: {
    name: "John Doe",
    amount: 1500,
  },
  options: {
    filename: "invoice",
  },
});

// Save to file
fs.writeFileSync(result.filename, result.pdf);

console.log(`PDF generated in ${result.generationTimeMs}ms`);
```

## Configuration

```typescript
const client = new DocumentStack({
  // Required: Your API key
  apiKey: "your-api-key",

  // Optional: Custom base URL (default: https://api.documentstack.dev)
  baseUrl: "https://api.documentstack.dev",

  // Optional: Request timeout in milliseconds (default: 30000)
  timeout: 30000,

  // Optional: Custom headers for all requests
  headers: {
    "X-Custom-Header": "value",
  },

  // Optional: Enable debug logging (default: false)
  debug: false,
});
```

## API Reference

### `client.generate(templateId, request)`

Generate a PDF from a template.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templateId` | `string` | Yes | The ID of the template to use |
| `request.data` | `Record<string, unknown>` | No | Template data for variable substitution |
| `request.options.filename` | `string` | No | Custom filename (without .pdf extension) |

**Returns:** `Promise<GenerateResponse>`

```typescript
interface GenerateResponse {
  pdf: Buffer;           // PDF binary data
  filename: string;      // Filename from response
  generationTimeMs: number; // Generation time in ms
  contentLength: number; // File size in bytes
}
```

## Error Handling

The SDK provides typed errors for different failure scenarios:

```typescript
import {
  DocumentStack,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
  TimeoutError,
  NetworkError,
} from "@documentstack/sdk";

try {
  const result = await client.generate("template-id", { data: {} });
} catch (error) {
  if (error instanceof ValidationError) {
    // 400: Invalid request
    console.error("Validation failed:", error.message);
  } else if (error instanceof AuthenticationError) {
    // 401: Invalid API key
    console.error("Authentication failed:", error.message);
  } else if (error instanceof ForbiddenError) {
    // 403: No access to template
    console.error("Access forbidden:", error.message);
  } else if (error instanceof NotFoundError) {
    // 404: Template not found
    console.error("Template not found:", error.message);
  } else if (error instanceof RateLimitError) {
    // 429: Rate limit exceeded
    console.error(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof ServerError) {
    // 500: Server error
    console.error("Server error:", error.message);
  } else if (error instanceof TimeoutError) {
    // Request timed out
    console.error("Request timed out");
  } else if (error instanceof NetworkError) {
    // Network failure
    console.error("Network error:", error.message);
  }
}
```

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions out of the box.

```typescript
import type {
  DocumentStackConfig,
  GenerateRequest,
  GenerateResponse,
  GenerateOptions,
} from "@documentstack/sdk";
```

## Requirements

- Node.js 18.0.0 or higher

## License

MIT
