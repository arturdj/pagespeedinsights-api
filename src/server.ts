import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AnalyzerService } from './services/analyzer.js';
import { AnalysisRequest } from './types/index.js';
import { validateAnalysisRequest } from './utils/validation.js';
import { generateManualInterfaceHTML } from './utils/manual-interface-template.js';
import { logError, sendErrorResponse, ErrorTypes, ErrorCodes } from './utils/error-handling.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const analyzerService = new AnalyzerService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Validation middleware for analysis requests
const validateAnalysisRequestMiddleware = (req: any, res: any, next: any) => {
  const validationResult = validateAnalysisRequest(
    req.body, 
    () => process.env.PAGESPEED_INSIGHTS_API_KEY
  );

  if (!validationResult.valid) {
    return res.status(400).json({ 
      error: validationResult.error,
      message: validationResult.message
    });
  }

  // Attach validated data to request
  req.analysisRequest = validationResult.data;
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main analysis endpoint
app.post('/analyze', validateAnalysisRequestMiddleware, async (req: any, res) => {
  try {
    const result = await analyzerService.analyzeWebsite(req.analysisRequest);
    
    // Remove sensitive data from response
    const response = { ...result };
    delete (response as any).api_key;

    res.json(response);

  } catch (error) {
    logError('Analysis error', error);
    sendErrorResponse(res, ErrorCodes.INTERNAL_SERVER_ERROR, ErrorTypes.ANALYSIS_FAILED, error);
  }
});

// Get HTML report endpoint
app.post('/report', validateAnalysisRequestMiddleware, async (req: any, res) => {
  try {
    const result = await analyzerService.analyzeWebsite(req.analysisRequest);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(result.html_report);

  } catch (error) {
    logError('Report generation error', error);
    sendErrorResponse(res, ErrorCodes.INTERNAL_SERVER_ERROR, ErrorTypes.REPORT_GENERATION_FAILED, error);
  }
});

// Get combined JSON analysis with HTML report endpoint
app.post('/full', validateAnalysisRequestMiddleware, async (req: any, res) => {
  try {
    const result = await analyzerService.analyzeWebsite(req.analysisRequest);
    
    // Remove sensitive data from response
    const response = { ...result };
    delete (response as any).api_key;

    res.json(response);

  } catch (error) {
    logError('Full analysis error', error);
    sendErrorResponse(res, ErrorCodes.INTERNAL_SERVER_ERROR, ErrorTypes.FULL_ANALYSIS_FAILED, error);
  }
});

// Get HTML report in JSON format endpoint
app.post('/html-json', validateAnalysisRequestMiddleware, async (req: any, res) => {
  try {
    const result = await analyzerService.analyzeWebsite(req.analysisRequest);
    
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
    const structuredResponse = {
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

    res.json(structuredResponse);

  } catch (error) {
    logError('HTML-JSON generation error', error);
    sendErrorResponse(res, ErrorCodes.INTERNAL_SERVER_ERROR, ErrorTypes.HTML_JSON_GENERATION_FAILED, error);
  }
});

// Manual testing interface endpoint
app.get('/manual', (req, res) => {
  const baseUrl = `http://localhost:${port}`;
  const manualInterface = generateManualInterfaceHTML(baseUrl);
  res.setHeader('Content-Type', 'text/html');
  res.send(manualInterface);
});

// API documentation endpoint
app.get('/docs', (req, res) => {
  const docs = {
    title: 'Azion PageSpeed Analyzer API',
    version: '1.0.0',
    description: 'TypeScript API for analyzing website performance using PageSpeed Insights and generating Azion optimization recommendations',
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
  
  res.json(docs);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Azion PageSpeed Analyzer API running on port ${port}`);
  console.log(`📊 Manual interface: http://localhost:${port}/manual`);
  console.log(`📖 API docs: http://localhost:${port}/docs`);
});
