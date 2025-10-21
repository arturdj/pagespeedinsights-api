// Shared error handling utilities

export interface ErrorResponse {
  error: string;
  message: string;
}

export function createErrorResponse(error: string, message: string): ErrorResponse {
  return { error, message };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}

export function logError(context: string, error: unknown): void {
  console.error(`${context}:`, error);
}

// Express.js error response helpers
export function sendErrorResponse(res: any, status: number, error: string, errorOrMessage?: unknown): void {
  const errorMessage = typeof errorOrMessage === 'string' ? errorOrMessage : getErrorMessage(errorOrMessage);
  res.status(status).json(createErrorResponse(error, errorMessage));
}

// Edge Function error response helpers
export function createErrorResponseObject(
  status: number, 
  error: string, 
  message?: string, 
  corsHeaders?: Record<string, string>
): Response {
  const errorMessage = message || 'Unknown error occurred';
  return new Response(
    JSON.stringify(createErrorResponse(error, errorMessage)),
    {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    }
  );
}

// Common error types and handlers
export const ErrorTypes = {
  ANALYSIS_FAILED: 'Analysis failed',
  REPORT_GENERATION_FAILED: 'Report generation failed',
  FULL_ANALYSIS_FAILED: 'Full analysis failed',
  HTML_JSON_GENERATION_FAILED: 'HTML-JSON generation failed',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  INVALID_JSON: 'Invalid JSON in request body',
  ENDPOINT_NOT_FOUND: 'Endpoint not found',
  REQUEST_HANDLING_ERROR: 'Request handling error'
} as const;

export const ErrorCodes = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;
