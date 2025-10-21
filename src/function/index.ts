import { AnalyzerService } from '../services/analyzer.js';
import { AnalysisRequest } from '../types/index.js';
import type { EdgeFunctionResponse } from '../types/event.js';
import { validateAnalysisRequest } from '../utils/validation.js';
import { generateManualInterfaceHTML } from '../utils/manual-interface-template.js';
import { logError, createErrorResponseObject, ErrorTypes, ErrorCodes } from '../utils/error-handling.js';

const analyzerService = new AnalyzerService();

interface RequestContext {
  request: Request;
  args?: any;
}

export async function handleRequest({ request, args }: RequestContext): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Health check endpoint
    if (url.pathname === '/health' && method === 'GET') {
      return new Response(
        JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Manual interface endpoint
    if (url.pathname === '/manual' && method === 'GET') {
      return handleManualInterface(corsHeaders);
    }

    // API documentation endpoint
    if (url.pathname === '/docs' && method === 'GET') {
      return handleDocsEndpoint(corsHeaders);
    }

    // Analysis endpoints
    if (method === 'POST') {
      const body = await request.text();
      let requestData: any;
      
      try {
        requestData = JSON.parse(body);
      } catch (error) {
        return createErrorResponseObject(
          ErrorCodes.BAD_REQUEST,
          ErrorTypes.INVALID_JSON,
          undefined,
          corsHeaders
        );
      }

      // Validate and prepare analysis request
      const validationResult = validateAnalysisRequestLocal(requestData);
      if (!validationResult.valid || !validationResult.data) {
        return createErrorResponseObject(
          ErrorCodes.BAD_REQUEST,
          ErrorTypes.VALIDATION_FAILED,
          validationResult.message,
          corsHeaders
        );
      }

      const analysisRequest = validationResult.data;

      // Route to appropriate handler
      switch (url.pathname) {
        case '/analyze':
          return handleAnalyzeEndpoint(analysisRequest, corsHeaders);
        case '/report':
          return handleReportEndpoint(analysisRequest, corsHeaders);
        case '/full':
          return handleFullEndpoint(analysisRequest, corsHeaders);
        case '/html-json':
          return handleHtmlJsonEndpoint(analysisRequest, corsHeaders);
        default:
          return createErrorResponseObject(
            ErrorCodes.NOT_FOUND,
            ErrorTypes.ENDPOINT_NOT_FOUND,
            undefined,
            corsHeaders
          );
      }
    }

    // Default 404 for unmatched routes
    return createErrorResponseObject(
      ErrorCodes.NOT_FOUND,
      ErrorTypes.ENDPOINT_NOT_FOUND,
      undefined,
      corsHeaders
    );

  } catch (error) {
    logError('Request handling error', error);
    return createErrorResponseObject(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      ErrorTypes.REQUEST_HANDLING_ERROR,
      error instanceof Error ? error.message : undefined,
      corsHeaders
    );
  }
}

// Use shared validation utility
function validateAnalysisRequestLocal(requestData: any) {
  return validateAnalysisRequest(
    requestData,
    () => Azion.env.get('PAGESPEED_INSIGHTS_API_KEY')
  );
}

async function handleAnalyzeEndpoint(analysisRequest: AnalysisRequest, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const result = await analyzerService.analyzeWebsite(analysisRequest);
    
    // Remove sensitive data from response
    const response = { ...result };
    delete (response as any).api_key;

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    logError('Analysis error', error);
    return createErrorResponseObject(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      ErrorTypes.ANALYSIS_FAILED,
      error instanceof Error ? error.message : undefined,
      corsHeaders
    );
  }
}

async function handleReportEndpoint(analysisRequest: AnalysisRequest, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const result = await analyzerService.analyzeWebsite(analysisRequest);
    
    return new Response(result.html_report, {
      status: 200,
      headers: { 'Content-Type': 'text/html', ...corsHeaders },
    });

  } catch (error) {
    logError('Report generation error', error);
    return createErrorResponseObject(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      ErrorTypes.REPORT_GENERATION_FAILED,
      error instanceof Error ? error.message : undefined,
      corsHeaders
    );
  }
}

async function handleFullEndpoint(analysisRequest: AnalysisRequest, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const result = await analyzerService.analyzeWebsite(analysisRequest);
    
    // Remove sensitive data from response
    const response = { ...result };
    delete (response as any).api_key;

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    logError('Full analysis error', error);
    return createErrorResponseObject(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      ErrorTypes.FULL_ANALYSIS_FAILED,
      error instanceof Error ? error.message : undefined,
      corsHeaders
    );
  }
}

async function handleHtmlJsonEndpoint(analysisRequest: AnalysisRequest, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const result = await analyzerService.analyzeWebsite(analysisRequest);
    
    // Extract structured data that populates the HTML report
    const analysis = result.analysis;
    const azionRecommendations = result.azion_recommendations;
    
    // Calculate overall score
    const scores = Object.values(analysis).map((cat: any) => cat.score).filter(score => score !== undefined);
    const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    // Count issues by priority
    const highPriorityIssues = Object.values(analysis)
      .flatMap((cat: any) => cat.issues)
      .filter((issue: any) => issue.impact === 'high').length;

    // Create structured response
    const htmlJsonResponse = {
      url: result.url,
      final_url: result.final_url,
      device: result.device,
      timestamp: result.timestamp,
      analysis: result.analysis,
      azion_recommendations: result.azion_recommendations,
      crux_data: result.crux_data,
      html_report: result.html_report,
      marketing_pitch: result.marketing_pitch,
      report_data: {
        overall_score: Math.round(overallScore),
        optimization_summary: {
          total_issues: Object.values(analysis).reduce((sum: number, cat: any) => sum + (cat.issues?.length || 0), 0),
          high_priority_issues: highPriorityIssues,
          azion_solutions: azionRecommendations?.solution_count || 0
        }
      }
    };

    return new Response(
      JSON.stringify(htmlJsonResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    logError('HTML-JSON generation error', error);
    return createErrorResponseObject(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      ErrorTypes.HTML_JSON_GENERATION_FAILED,
      error instanceof Error ? error.message : undefined,
      corsHeaders
    );
  }
}

function handleDocsEndpoint(corsHeaders: Record<string, string>): Response {
  const docs = {
    title: 'Azion PageSpeed Analyzer API',
    version: '1.0.0',
    description: 'Edge Function API for analyzing website performance using PageSpeed Insights and generating Azion optimization recommendations',
    endpoints: {
      '/health': {
        method: 'GET',
        description: 'Health check endpoint',
        response: { status: 'OK', timestamp: '2024-01-01T00:00:00.000Z' }
      },
      '/analyze': {
        method: 'POST',
        description: 'Analyze website performance and get JSON response',
        body: {
          url: 'string (required)',
          device: 'mobile | desktop | tablet (default: mobile)',
          use_crux: 'boolean (default: false)',
          weeks: 'number (default: 25)',
          follow_redirects: 'boolean (default: false)'
        }
      },
      '/report': {
        method: 'POST',
        description: 'Generate HTML performance report',
        body: 'Same as /analyze'
      },
      '/full': {
        method: 'POST',
        description: 'Get complete analysis with both JSON and HTML report',
        body: 'Same as /analyze'
      },
      '/html-json': {
        method: 'POST',
        description: 'Get HTML report data in JSON format with additional metadata',
        body: 'Same as /analyze'
      },
      '/manual': {
        method: 'GET',
        description: 'Interactive manual testing interface'
      }
    }
  };

  return new Response(
    JSON.stringify(docs, null, 2),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    }
  );
}

function handleManualInterface(corsHeaders: Record<string, string>): Response {
  const manualInterface = generateManualInterfaceHTML('');

  return new Response(manualInterface, {
    status: 200,
    headers: { 'Content-Type': 'text/html', ...corsHeaders },
  });
}
