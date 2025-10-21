import { AnalyzerService } from '../services/analyzer.js';
import { AnalysisRequest } from '../types/index.js';

const analyzerService = new AnalyzerService();

export interface ValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
  data?: AnalysisRequest;
}

export function validateAnalysisRequest(requestData: any, getApiKey?: () => string | null | undefined): ValidationResult {
  const { url, device, use_crux, weeks, api_key, follow_redirects } = requestData;

  // Use API key from environment variable or request body as fallback
  const finalApiKey = getApiKey?.() || api_key;

  // Validate required fields
  if (!finalApiKey) {
    return {
      valid: false,
      error: 'API key is required',
      message: 'Please set PAGESPEED_INSIGHTS_API_KEY environment variable or provide API key in request body'
    };
  }

  if (!analyzerService.validateApiKey(finalApiKey)) {
    return {
      valid: false,
      error: 'Invalid API key',
      message: 'API key must be valid and at least 10 characters long'
    };
  }

  const validatedUrl = analyzerService.validateUrl(url);

  return {
    valid: true,
    data: {
      url: validatedUrl,
      device: device || 'mobile',
      use_crux: use_crux || false,
      weeks: weeks || 25,
      api_key: finalApiKey,
      follow_redirects: follow_redirects || false
    }
  };
}
