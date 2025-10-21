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
        case '/solutions':
          return handleSolutionsEndpoint(analysisRequest, corsHeaders);
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
    
    // Remove sensitive data and HTML report from response (analyze endpoint returns JSON data only)
    const response = { ...result };
    delete (response as any).api_key;
    delete (response as any).html_report;

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


async function handleSolutionsEndpoint(analysisRequest: AnalysisRequest, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const result = await analyzerService.analyzeWebsite(analysisRequest);
    
    // Extract analysis and recommendations
    const analysis = result.analysis;
    const azionRecommendations = result.azion_recommendations;
    
    // Calculate performance metrics
    const scores = Object.values(analysis).map((cat: any) => cat.score).filter(score => score !== undefined);
    const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    
    // Categorize issues by priority and impact
    const allIssues = Object.values(analysis).flatMap((cat: any) => cat.issues || []);
    const issuesByPriority = {
      high: allIssues.filter((issue: any) => issue.impact === 'high'),
      medium: allIssues.filter((issue: any) => issue.impact === 'medium'),
      low: allIssues.filter((issue: any) => issue.impact === 'low')
    };

    // Create structured solutions response optimized for LLMs and tools
    const solutionsResponse = {
      metadata: {
        url: result.url,
        final_url: result.final_url,
        device: result.device,
        analysis_timestamp: result.timestamp,
        overall_performance_score: overallScore,
        total_issues_detected: allIssues.length,
        api_version: "3.0.0"
      },
      
      performance_assessment: {
        scores_by_category: {
          performance: analysis.performance?.score || 0,
          accessibility: analysis.accessibility?.score || 0,
          best_practices: analysis.best_practices?.score || 0,
          seo: analysis.seo?.score || 0
        },
        
        issues_breakdown: {
          high_priority: {
            count: issuesByPriority.high.length,
            issues: issuesByPriority.high.map((issue: any) => ({
              id: issue.id,
              title: issue.title,
              description: issue.description,
              impact_score: issue.score,
              potential_savings: issue.display_value,
              category: getCategoryForIssue(issue.id, analysis)
            }))
          },
          medium_priority: {
            count: issuesByPriority.medium.length,
            issues: issuesByPriority.medium.map((issue: any) => ({
              id: issue.id,
              title: issue.title,
              description: issue.description,
              impact_score: issue.score,
              potential_savings: issue.display_value,
              category: getCategoryForIssue(issue.id, analysis)
            }))
          },
          low_priority: {
            count: issuesByPriority.low.length,
            issues: issuesByPriority.low.map((issue: any) => ({
              id: issue.id,
              title: issue.title,
              description: issue.description,
              impact_score: issue.score,
              potential_savings: issue.display_value,
              category: getCategoryForIssue(issue.id, analysis)
            }))
          }
        }
      },

      azion_solutions: {
        summary: {
          total_applicable_solutions: azionRecommendations?.solution_count || 0,
          estimated_impact: azionRecommendations?.marketing_data?.summary?.estimated_impact || 'medium',
          implementation_priority: getImplementationPriority(issuesByPriority)
        },
        
        recommended_products: Object.values(azionRecommendations?.marketing_data?.solutions_overview || {}).map((solution: any) => ({
          id: solution.id,
          name: solution.name,
          description: solution.description,
          key_features: solution.features,
          business_benefits: solution.benefits,
          documentation_url: solution.url,
          applicable_issues: getApplicableIssuesForSolution(solution.id, azionRecommendations)
        })),

        implementation_roadmap: azionRecommendations?.marketing_data?.action_plan?.map((action: any, index: number) => ({
          step: index + 1,
          title: action.title,
          description: action.description,
          priority: action.priority,
          category: action.category,
          estimated_savings: action.potential_savings,
          recommended_azion_products: action.recommended_solutions,
          implementation_complexity: action.implementation_complexity,
          technical_context: {
            current_performance_impact: action.pagespeed_insights_context?.current_value || '',
            performance_score: action.pagespeed_insights_context?.score || 0,
            technical_details: action.pagespeed_insights_context?.original_description || ''
          }
        })) || []
      },

      optimization_insights: {
        quick_wins: azionRecommendations?.marketing_data?.action_plan
          ?.filter((action: any) => action.implementation_complexity === 'low' && action.priority === 'high')
          ?.slice(0, 3)
          ?.map((action: any) => ({
            title: action.title,
            description: action.description,
            estimated_savings: action.potential_savings,
            azion_solution: action.recommended_solutions?.[0] || 'Multiple solutions'
          })) || [],
          
        major_improvements: azionRecommendations?.marketing_data?.action_plan
          ?.filter((action: any) => action.priority === 'high')
          ?.slice(0, 5)
          ?.map((action: any) => ({
            title: action.title,
            description: action.description,
            estimated_savings: action.potential_savings,
            complexity: action.implementation_complexity,
            azion_solutions: action.recommended_solutions || []
          })) || [],

        console_errors: azionRecommendations?.marketing_data?.summary?.console_errors?.has_console_errors ? {
          detected: true,
          total_errors: azionRecommendations.marketing_data.summary.console_errors.total_console_errors,
          error_types: azionRecommendations.marketing_data.summary.console_errors.error_types,
          recommended_solution: "Azion Functions and Firewall for error handling and monitoring"
        } : {
          detected: false,
          message: "No console errors detected"
        }
      },

      crux_data: result.crux_data ? {
        has_real_user_data: result.crux_data.has_crux_data,
        core_web_vitals_trend: result.crux_data.has_crux_data ? "Available in full analysis" : "No historical data available",
        recommendation: result.crux_data.has_crux_data 
          ? "Use /full endpoint for detailed Core Web Vitals trends"
          : "Consider implementing Azion solutions to improve user experience metrics"
      } : null,

      next_steps: {
        immediate_actions: [
          "Review high-priority issues in the performance_assessment section",
          "Examine recommended Azion products for your specific use case",
          "Consider implementing quick wins for immediate performance gains"
        ],
        
        consultation_recommendation: issuesByPriority.high.length > 3 
          ? "Consider Azion's Best Practices Review service for comprehensive optimization strategy"
          : "Azion's standard solutions should address most identified issues",
          
        api_usage_suggestions: [
          "Use /analyze endpoint for detailed technical analysis",
          "Use /report endpoint for shareable HTML performance reports",
          "Use /full endpoint for complete data including CrUX metrics"
        ]
      }
    };

    return new Response(
      JSON.stringify(solutionsResponse, null, 2),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    logError('Solutions endpoint error', error);
    return createErrorResponseObject(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      ErrorTypes.ANALYSIS_FAILED,
      error instanceof Error ? error.message : undefined,
      corsHeaders
    );
  }
}

// Helper functions for the solutions endpoint
function getCategoryForIssue(issueId: string, analysis: any): string {
  for (const [categoryName, categoryData] of Object.entries(analysis)) {
    if (categoryData && typeof categoryData === 'object' && 'issues' in categoryData) {
      const issues = (categoryData as any).issues || [];
      if (issues.some((issue: any) => issue.id === issueId)) {
        return categoryName;
      }
    }
  }
  return 'unknown';
}

function getImplementationPriority(issuesByPriority: any): string {
  if (issuesByPriority.high.length > 5) return 'urgent';
  if (issuesByPriority.high.length > 2) return 'high';
  if (issuesByPriority.medium.length > 3) return 'medium';
  return 'low';
}

function getApplicableIssuesForSolution(solutionId: string, recommendations: any): string[] {
  if (!recommendations?.recommendations) return [];
  
  return recommendations.recommendations
    .filter((rec: any) => rec.azion_solution?.solutions?.some((sol: any) => sol.id === solutionId))
    .map((rec: any) => rec.issue?.id)
    .filter((id: string) => id) || [];
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
        description: 'Analyze website performance and get JSON response (analysis data only, no HTML report)',
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
        description: 'Get complete analysis with both JSON data and HTML report included',
        body: 'Same as /analyze'
      },
      '/solutions': {
        method: 'POST',
        description: 'Get structured Azion solutions and optimization insights in JSON format optimized for LLMs and tools',
        body: 'Same as /analyze',
        response_features: [
          'Performance assessment with categorized issues',
          'Recommended Azion products with applicable use cases',
          'Implementation roadmap with priority and complexity',
          'Quick wins and major improvement opportunities',
          'Console error analysis and recommendations',
          'Next steps and consultation guidance'
        ]
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
