import { AnalyzerService } from '../services/analyzer.js';
import { AnalysisRequest } from '../types/index.js';
import type { EdgeFunctionResponse } from '../types/event.js';

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

  // Add CORS headers to all responses
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

    // Documentation endpoint
    if (url.pathname === '/docs' && method === 'GET') {
      return handleDocsEndpoint(corsHeaders);
    }

    // Manual interface endpoint
    if (url.pathname === '/manual' && method === 'GET') {
      return handleManualInterface(corsHeaders);
    }

    // Analysis endpoints - all require POST
    if (method === 'POST') {
      const body = await request.text();
      let requestData;
      
      try {
        requestData = JSON.parse(body);
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Validate and prepare analysis request
      const validationResult = validateAnalysisRequest(requestData);
      if (!validationResult.valid || !validationResult.data) {
        return new Response(
          JSON.stringify({ error: validationResult.error, message: validationResult.message }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
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
          return new Response(
            JSON.stringify({ error: 'Endpoint not found' }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
      }
    }

    // Default 404 for unmatched routes
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Request handling error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

function validateAnalysisRequest(requestData: any): { valid: boolean; error?: string; message?: string; data?: AnalysisRequest } {
  const { url, device, use_crux, weeks, api_key } = requestData;

  // Use API key from environment variable or request body as fallback
  const finalApiKey = process.env.PAGESPEED_INSIGHTS_API_KEY || api_key;

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
      api_key: finalApiKey
    }
  };
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
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
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
    console.error('Report generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Report generation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
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
    console.error('Full analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Full analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
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
    
    // Group recommendations by category
    const recommendationsByCategory: Record<string, any[]> = {};
    for (const rec of azionRecommendations.recommendations) {
      const category = rec.category;
      if (!recommendationsByCategory[category]) {
        recommendationsByCategory[category] = [];
      }
      recommendationsByCategory[category].push(rec);
    }
    
    // Structure the data as it appears in the HTML report
    const htmlJsonResponse = {
      success: true,
      timestamp: result.timestamp,
      url: result.url,
      device: result.device,
      report_data: {
        header: {
          title: `Azion Performance Analysis`,
          subtitle: `Comprehensive website optimization recommendations for ${result.url}`,
          generated_on: result.timestamp
        },
        overall_score: {
          value: Math.round(overallScore),
          label: "Overall Score",
          status: overallScore >= 80 ? 'good' : overallScore >= 50 ? 'average' : 'poor'
        },
        category_scores: Object.entries(analysis).map(([category, data]: [string, any]) => ({
          category: category,
          label: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          score: Math.round(data.score),
          status: data.score >= 80 ? 'good' : data.score >= 50 ? 'average' : 'poor',
          issues_count: data.issues.length
        })),
        optimization_summary: {
          total_issues: azionRecommendations.marketing_data.summary.total_issues,
          high_priority_issues: azionRecommendations.marketing_data.summary.high_priority_issues,
          medium_priority_issues: azionRecommendations.marketing_data.summary.medium_priority_issues,
          low_priority_issues: azionRecommendations.marketing_data.summary.low_priority_issues,
          azion_solutions_count: azionRecommendations.solution_count,
          potential_speed_gain: "40%",
          console_errors: azionRecommendations.marketing_data.summary.console_errors
        },
        crux_data: result.crux_data ? {
          has_data: true,
          dates: result.crux_data.dates,
          metrics: result.crux_data.metrics,
          has_pagespeed_data: result.crux_data.has_pagespeed_data,
          has_crux_data: result.crux_data.has_crux_data
        } : { has_data: false },
        marketing_pitch: result.marketing_pitch
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
    console.error('HTML-JSON generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'HTML-JSON generation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

function handleDocsEndpoint(corsHeaders: Record<string, string>): Response {
  const docs = {
    title: "Azion PageSpeed Analyzer API",
    version: "1.0.0",
    description: "Comprehensive website performance analysis with Azion optimization recommendations",
    endpoints: {
      "/health": {
        method: "GET",
        description: "Health check endpoint",
        response: "JSON status object"
      },
      "/analyze": {
        method: "POST",
        description: "Get JSON analysis data only",
        body: {
          url: "string (required)",
          device: "string (mobile|desktop|tablet, default: mobile)",
          use_crux: "boolean (default: false)",
          weeks: "number (1-40, default: 25)",
          api_key: "string (optional if env var set)"
        }
      },
      "/report": {
        method: "POST", 
        description: "Get HTML report only",
        body: "Same as /analyze"
      },
      "/full": {
        method: "POST",
        description: "Get both JSON analysis and HTML report", 
        body: "Same as /analyze"
      },
      "/html-json": {
        method: "POST",
        description: "Get HTML report data in JSON format",
        body: "Same as /analyze"
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
  const manualInterface = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azion PageSpeed Analyzer - Manual Interface</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%);
            color: #FFFFFF;
            min-height: 100vh;
            padding: 10px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: linear-gradient(135deg, #F3652B 0%, #FF8C42 100%);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
            color: white;
        }
        
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            align-items: start;
        }
        
        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
        }
        
        .form-container {
            background: #1A1A1A;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #F3652B;
        }
        
        .request-formats {
            background: #1A1A1A;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #34A853;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        @media (max-width: 480px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #F3652B;
            font-weight: 600;
            font-size: 14px;
        }
        
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 8px 12px;
            border: 2px solid #333;
            border-radius: 6px;
            background: #0D0D0D;
            color: #FFFFFF;
            font-size: 14px;
        }
        
        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #F3652B;
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
        }
        
        .checkbox-group input[type="checkbox"] {
            width: auto;
        }
        
        .checkbox-group label {
            margin-bottom: 0;
            font-size: 13px;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-block;
            text-align: center;
            flex: 1;
            min-width: 120px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #F3652B 0%, #FF8C42 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(243, 101, 43, 0.3);
        }
        
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: #F3652B;
            grid-column: 1 / -1;
            background: #1A1A1A;
            border-radius: 8px;
            border-left: 4px solid #F3652B;
        }
        
        .progress-container {
            margin: 20px 0;
            background: #0D0D0D;
            border-radius: 10px;
            overflow: hidden;
            height: 8px;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #F3652B 0%, #FF8C42 100%);
            width: 0%;
            transition: width 0.3s ease;
            border-radius: 10px;
        }
        
        .progress-text {
            margin-top: 10px;
            font-size: 14px;
            color: #CCC;
        }
        
        .progress-time {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }
        
        .error {
            display: none;
            background: #2A1A1A;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #EA4335;
            margin-top: 15px;
            color: #EA4335;
            grid-column: 1 / -1;
        }
        
        .code-container {
            position: relative;
            margin: 10px 0;
        }
        
        .code-block {
            background: #0D0D0D;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            position: relative;
        }
        
        .code-block pre {
            margin: 0;
            color: #CCC;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .copy-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #F3652B;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        
        .copy-btn:hover {
            opacity: 1;
        }
        
        .copy-btn.copied {
            background: #34A853;
        }
        
        .code-tabs {
            display: flex;
            gap: 2px;
            margin-bottom: 15px;
            border-bottom: 2px solid #333;
        }
        
        .code-tab {
            padding: 8px 16px;
            background: #333;
            color: #CCC;
            border: none;
            border-radius: 6px 6px 0 0;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s;
            border-bottom: 2px solid transparent;
        }
        
        .code-tab:hover {
            background: #444;
            color: #FFF;
        }
        
        .code-tab.active {
            background: #F3652B;
            color: white;
            border-bottom-color: #F3652B;
        }
        
        .code-tab-content {
            display: none;
        }
        
        .code-tab-content.active {
            display: block;
        }
        
        .result-section {
            display: none;
            grid-column: 1 / -1;
            background: #1A1A1A;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #34A853;
            margin-top: 20px;
        }
        
        .result-section.show {
            display: block;
        }
        
        .result-header {
            color: #34A853;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .url-input-helper {
            color: #999;
            font-size: 11px;
            margin-top: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Azion PageSpeed Analyzer</h1>
            <p>Comprehensive Manual Testing Interface</p>
        </div>
        
        <div class="main-content">
            <div class="form-container">
                <h3 style="color: #F3652B; margin-bottom: 15px; font-size: 16px;">Configuration</h3>
                
                <form id="analysisForm">
                    <div class="form-group">
                        <label for="url">Website URL *</label>
                        <input type="url" id="url" name="url" placeholder="https://www.azion.com" value="https://www.azion.com" required>
                        <div class="url-input-helper">https:// added automatically if needed</div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="device">Device</label>
                            <select id="device" name="device">
                                <option value="mobile">Mobile</option>
                                <option value="desktop">Desktop</option>
                                <option value="tablet">Tablet</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="endpoint">Output Type</label>
                            <select id="endpoint" name="endpoint">
                                <option value="analyze">JSON Analysis</option>
                                <option value="report">HTML Report</option>
                                <option value="full">Full JSON + HTML</option>
                                <option value="html-json">HTML in JSON Format</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="checkbox-group">
                            <input type="checkbox" id="useCrux" name="useCrux">
                            <label for="useCrux">Include CrUX History Data</label>
                        </div>
                        
                        <div class="form-group" id="weeksGroup" style="display: none;">
                            <label for="weeks">CrUX Weeks</label>
                            <input type="number" id="weeks" name="weeks" min="1" max="40" value="25">
                        </div>
                    </div>
                    
                    <div class="button-group">
                        <button type="submit" class="btn btn-primary" id="submitBtn">
                            🚀 Execute Request
                        </button>
                    </div>
                </form>
            </div>
            
            <div class="request-formats">
                <h3 style="color: #34A853; margin-bottom: 15px; font-size: 16px;">Request Formats</h3>
                
                <div class="code-tabs">
                    <button class="code-tab active" onclick="showCodeTab('curl')">cURL</button>
                    <button class="code-tab" onclick="showCodeTab('javascript')">JavaScript</button>
                    <button class="code-tab" onclick="showCodeTab('python')">Python</button>
                </div>
                
                <div id="curl" class="code-tab-content active">
                    <div class="code-container">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyToClipboard('curlCommand', this)">Copy</button>
                            <pre id="curlCommand">Configure options to generate request</pre>
                        </div>
                    </div>
                </div>
                
                <div id="javascript" class="code-tab-content">
                    <div class="code-container">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyToClipboard('fetchCommand', this)">Copy</button>
                            <pre id="fetchCommand">Configure options to generate request</pre>
                        </div>
                    </div>
                </div>
                
                <div id="python" class="code-tab-content">
                    <div class="code-container">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyToClipboard('pythonCommand', this)">Copy</button>
                            <pre id="pythonCommand">Configure options to generate request</pre>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="loading" id="loading">
                <h4 id="loadingTitle">🔄 Analyzing performance...</h4>
                <div class="progress-container">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <div class="progress-text" id="progressText">Initializing analysis...</div>
                <div class="progress-time" id="progressTime">Elapsed: 0s / Est. 120s</div>
            </div>
            
            <div class="error" id="error"></div>
        </div>
        
        <div class="result-section" id="result">
            <h3 class="result-header">✅ Analysis Complete</h3>
            <div id="summaryContent"></div>
            <div style="margin-top: 20px;">
                <h4 style="color: #F3652B; margin-bottom: 10px;">📄 Response Data</h4>
                <div class="code-container">
                    <div class="code-block">
                        <button class="copy-btn" onclick="copyToClipboard('responseData', this)">Copy</button>
                        <pre id="responseData"></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const form = document.getElementById('analysisForm');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const result = document.getElementById('result');
        const useCruxCheckbox = document.getElementById('useCrux');
        const weeksGroup = document.getElementById('weeksGroup');
        const endpointSelect = document.getElementById('endpoint');
        const submitBtn = document.getElementById('submitBtn');
        
        // Show/hide weeks input based on CrUX checkbox
        useCruxCheckbox.addEventListener('change', function() {
            weeksGroup.style.display = this.checked ? 'block' : 'none';
            updateRequestFormats();
        });
        
        // Update button text and request formats when endpoint changes
        endpointSelect.addEventListener('change', function() {
            const endpoint = this.value;
            let buttonText = '🔍 Analyze Website';
            if (endpoint === 'report') {
                buttonText = '📄 Generate Report';
            } else if (endpoint === 'full') {
                buttonText = '📊 Get Full Analysis';
            } else if (endpoint === 'html-json') {
                buttonText = '📋 Get HTML as JSON';
            }
            submitBtn.innerHTML = buttonText;
            updateRequestFormats();
        });
        
        // Update request formats when form changes
        form.addEventListener('input', updateRequestFormats);
        form.addEventListener('change', updateRequestFormats);
        
        // Initial update
        updateRequestFormats();
        
        // Form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const endpoint = '/' + endpointSelect.value;
            const endpointType = endpointSelect.value;
            await performAnalysis(endpoint, endpointType);
        });
        
        function getCurrentRequestData() {
            const formData = new FormData(form);
            return {
                url: formData.get('url') || 'https://www.azion.com',
                device: formData.get('device') || 'mobile',
                use_crux: formData.get('useCrux') === 'on',
                weeks: parseInt(formData.get('weeks')) || 25
            };
        }
        
        function updateRequestFormats() {
            const data = getCurrentRequestData();
            const baseUrl = window.location.origin;
            const endpoint = endpointSelect.value;
            
            // cURL command
            const curlCommand = 'curl -X POST \\\\\\n' +
                '  -H "Content-Type: application/json" \\\\\\n' +
                '  -d \\'' + JSON.stringify(data, null, 2) + '\\' \\\\\\n' +
                '  ' + baseUrl + '/' + endpoint;
            document.getElementById('curlCommand').textContent = curlCommand;
            
            // JavaScript Fetch
            const fetchCommand = 'fetch(\\'' + baseUrl + '/' + endpoint + '\\', {\\n' +
                '  method: \\'POST\\',\\n' +
                '  headers: {\\n' +
                '    \\'Content-Type\\': \\'application/json\\'\\n' +
                '  },\\n' +
                '  body: JSON.stringify(' + JSON.stringify(data, null, 2) + ')\\n' +
                '})\\n' +
                '.then(response => response.json())\\n' +
                '.then(data => console.log(data))\\n' +
                '.catch(error => console.error(\\'Error:\\', error));';
            document.getElementById('fetchCommand').textContent = fetchCommand;
            
            // Python requests
            const pythonCommand = 'import requests\\n' +
                'import json\\n\\n' +
                'url = "' + baseUrl + '/' + endpoint + '"\\n' +
                'data = ' + JSON.stringify(data, null, 2) + '\\n\\n' +
                'response = requests.post(url, json=data)\\n' +
                'result = response.json()\\n' +
                'print(json.dumps(result, indent=2))';
            document.getElementById('pythonCommand').textContent = pythonCommand;
        }
        
        function showCodeTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.code-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.code-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
        }
        
        function copyToClipboard(elementId, button) {
            const element = document.getElementById(elementId);
            const text = element.textContent;
            const originalText = button.textContent;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    button.textContent = 'Copied!';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            }
        }
        
        async function performAnalysis(endpoint, endpointType) {
            const data = getCurrentRequestData();
            
            // Hide previous results
            error.style.display = 'none';
            result.classList.remove('show');
            loading.style.display = 'block';
            
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                loading.style.display = 'none';
                
                if (endpointType === 'report') {
                    if (response.ok) {
                        const htmlContent = await response.text();
                        displayResult('HTML Report Generated', htmlContent, true);
                    } else {
                        throw new Error('Failed to generate report');
                    }
                    return;
                }
                
                const responseData = await response.json();
                
                if (!response.ok) {
                    throw new Error(responseData.message || 'Analysis failed');
                }
                
                displayResult('Analysis Complete', JSON.stringify(responseData, null, 2), false);
                
            } catch (err) {
                loading.style.display = 'none';
                error.style.display = 'block';
                error.textContent = 'Error: ' + err.message;
            }
        }
        
        function displayResult(title, content, isHtml) {
            result.classList.add('show');
            document.getElementById('summaryContent').innerHTML = '<h4 style="color: #34A853;">' + title + '</h4>';
            
            if (isHtml) {
                document.getElementById('responseData').innerHTML = '';
                const iframe = document.createElement('iframe');
                iframe.srcdoc = content;
                iframe.style.width = '100%';
                iframe.style.height = '600px';
                iframe.style.border = '1px solid #333';
                iframe.style.borderRadius = '6px';
                document.getElementById('responseData').appendChild(iframe);
            } else {
                document.getElementById('responseData').textContent = content;
            }
        }
    </script>
</body>
</html>`;

  return new Response(manualInterface, {
    status: 200,
    headers: { 'Content-Type': 'text/html', ...corsHeaders },
  });
}
