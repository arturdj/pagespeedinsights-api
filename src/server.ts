import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AnalyzerService } from './services/analyzer.js';
import { AnalysisRequest } from './types/index.js';

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
const validateAnalysisRequest = (req: any, res: any, next: any) => {
  const { url, device, use_crux, weeks, api_key } = req.body;

  // Use API key from environment variable or request body as fallback
  const finalApiKey = process.env.PAGESPEED_INSIGHTS_API_KEY || api_key;

  // Validate required fields
  if (!finalApiKey) {
    return res.status(400).json({ 
      error: 'API key is required',
      message: 'Please set PAGESPEED_INSIGHTS_API_KEY environment variable or provide API key in request body' 
    });
  }

  if (!analyzerService.validateApiKey(finalApiKey)) {
    return res.status(400).json({ 
      error: 'Invalid API key',
      message: 'API key must be valid and at least 10 characters long' 
    });
  }

  const validatedUrl = analyzerService.validateUrl(url);

  // Attach validated data to request
  req.analysisRequest = {
    url: validatedUrl,
    device: device || 'mobile',
    use_crux: use_crux || false,
    weeks: weeks || 25,
    api_key: finalApiKey
  };

  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main analysis endpoint
app.post('/analyze', validateAnalysisRequest, async (req: any, res) => {
  try {
    const result = await analyzerService.analyzeWebsite(req.analysisRequest);
    
    // Remove sensitive data from response
    const response = { ...result };
    delete (response as any).api_key;

    res.json(response);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get HTML report endpoint
app.post('/report', validateAnalysisRequest, async (req: any, res) => {
  try {
    const result = await analyzerService.analyzeWebsite(req.analysisRequest);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(result.html_report);

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ 
      error: 'Report generation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get combined JSON analysis with HTML report endpoint
app.post('/full', validateAnalysisRequest, async (req: any, res) => {
  try {
    const result = await analyzerService.analyzeWebsite(req.analysisRequest);
    
    // Remove sensitive data from response
    const response = { ...result };
    delete (response as any).api_key;

    res.json(response);

  } catch (error) {
    console.error('Full analysis error:', error);
    res.status(500).json({ 
      error: 'Full analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get HTML report in JSON format endpoint
app.post('/html-json', validateAnalysisRequest, async (req: any, res) => {
  try {
    const result = await analyzerService.analyzeWebsite(req.analysisRequest);
    
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
        categories: Object.entries(analysis).map(([categoryKey, categoryData]: [string, any]) => {
          const categoryRecommendations = recommendationsByCategory[categoryKey] || [];
          const categoryInfo = {
            performance: { title: 'Performance Optimization', icon: '⚡', color: '#F3652B', description: 'Core Web Vitals and loading performance optimizations' },
            accessibility: { title: 'Accessibility Enhancement', icon: '♿', color: '#34A853', description: 'WCAG compliance and inclusive user experience improvements' },
            best_practices: { title: 'Security & Best Practices', icon: '🛡️', color: '#4285F4', description: 'Security, privacy, and modern web standards compliance' },
            seo: { title: 'SEO Optimization', icon: '🔍', color: '#FBBC04', description: 'Search engine visibility and discoverability improvements' }
          }[categoryKey];
          
          if (!categoryInfo || categoryData.issues.length === 0) return null;
          
          return {
            category: categoryKey,
            title: categoryInfo.title,
            icon: categoryInfo.icon,
            color: categoryInfo.color,
            description: categoryInfo.description,
            score: Math.round(categoryData.score),
            issues_count: categoryData.issues.length,
            recommendations: categoryRecommendations.slice(0, 8).map(rec => ({
              issue: {
                id: rec.issue.id,
                title: rec.issue.title,
                description: rec.issue.description,
                score: rec.issue.score,
                display_value: rec.issue.display_value,
                impact: rec.issue.impact,
                console_errors: rec.issue.console_errors || [],
                console_error_count: rec.issue.console_error_count || 0
              },
              solution: {
                priority: rec.azion_solution.priority,
                description: rec.azion_solution.description,
                solutions: rec.azion_solution.solutions.slice(0, 3).map((sol: any) => ({
                  id: sol.id,
                  name: sol.name,
                  description: sol.description,
                  features: sol.features,
                  benefits: sol.benefits,
                  url: sol.url
                }))
              }
            })),
            summary: {
              high_priority: categoryRecommendations.filter(rec => rec.azion_solution.priority === 'high').length,
              medium_priority: categoryRecommendations.filter(rec => rec.azion_solution.priority === 'medium').length,
              unique_solutions: new Set(categoryRecommendations.flatMap(rec => rec.azion_solution.solutions.map((s: any) => s.id))).size
            }
          };
        }).filter(Boolean),
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

    res.json(htmlJsonResponse);

  } catch (error) {
    console.error('HTML-JSON generation error:', error);
    res.status(500).json({ 
      error: 'HTML-JSON generation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Manual testing interface endpoint
app.get('/manual', (req, res) => {
  const manualInterface = `
<!DOCTYPE html>
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
        
        .btn-secondary {
            background: #333;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #444;
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
        
        .format-section {
            margin-bottom: 20px;
        }
        
        .format-section h4 {
            color: #F3652B;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .summary-item {
            text-align: center;
            background: #0D0D0D;
            padding: 12px 8px;
            border-radius: 6px;
        }
        
        .summary-value {
            font-size: 18px;
            font-weight: bold;
            color: #F3652B;
        }
        
        .summary-label {
            color: #CCC;
            font-size: 11px;
            margin-top: 2px;
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
        
        .report-link {
            display: inline-block;
            background: linear-gradient(135deg, #34A853 0%, #4CAF50 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 15px 0;
            transition: all 0.2s;
        }
        
        .report-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(52, 168, 83, 0.3);
            color: white;
            text-decoration: none;
        }
        
        .report-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 15px;
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
        
        .expandable-section {
            border: 2px solid #333;
            border-radius: 8px;
            margin: 15px 0;
            background: #1A1A1A;
        }
        
        .expandable-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            cursor: pointer;
            background: #0D0D0D;
            border-radius: 6px 6px 0 0;
            transition: background-color 0.2s;
        }
        
        .expandable-header:hover {
            background: #1A1A1A;
        }
        
        .expandable-header h4 {
            margin: 0;
            color: #F3652B;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .expand-toggle {
            background: none;
            border: none;
            color: #F3652B;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
            padding: 4px;
            border-radius: 4px;
        }
        
        .expand-toggle:hover {
            background: #333;
        }
        
        .expand-toggle.expanded {
            transform: rotate(180deg);
        }
        
        .expandable-content {
            display: none;
            padding: 0;
            border-top: 1px solid #333;
        }
        
        .expandable-content.expanded {
            display: block;
        }
        
        .expandable-content .code-container {
            margin: 0;
            border-radius: 0 0 6px 6px;
        }
        
        .expandable-content .code-block {
            border-radius: 0 0 6px 6px;
            max-height: none;
        }
        
        .response-stats {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 12px;
            color: #999;
        }
        
        .response-stat {
            display: flex;
            align-items: center;
            gap: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Azion PageSpeed Analyzer</h1>
            <p>Compact Manual Testing Interface</p>
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
            
            <div class="expandable-section">
                <div class="expandable-header" onclick="toggleExpandableSection('fullResponseSection')">
                    <h4>
                        📄 Full Response
                        <span class="response-stats" id="responseStats" style="display: none;">
                            <span class="response-stat">
                                <span>📊</span>
                                <span id="responseSize">0 KB</span>
                            </span>
                            <span class="response-stat">
                                <span>📝</span>
                                <span id="responseLines">0 lines</span>
                            </span>
                        </span>
                    </h4>
                    <button class="expand-toggle" id="fullResponseToggle">▼</button>
                </div>
                <div class="expandable-content" id="fullResponseContent">
                    <div class="code-container">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyToClipboard('responseData', this)">Copy</button>
                            <pre id="responseData"></pre>
                        </div>
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
            const isReport = endpoint === 'report';
            const isFull = endpoint === 'full';
            const isHtmlJson = endpoint === 'html-json';
            
            // cURL command
            const curlCommand = 'curl -X POST \\\\\\n' +
                '  -H "Content-Type: application/json" \\\\\\n' +
                '  -d \\'' + JSON.stringify(data, null, 2) + '\\' \\\\\\n' +
                '  ' + baseUrl + '/' + endpoint;
            document.getElementById('curlCommand').textContent = curlCommand;
            
            // JavaScript Fetch
            let responseHandler;
            if (isReport) {
                responseHandler = '.then(response => response.text())\\n.then(html => {\\n  // Create downloadable link for HTML report\\n  const blob = new Blob([html], { type: \\'text/html\\' });\\n  const url = URL.createObjectURL(blob);\\n  const a = document.createElement(\\'a\\');\\n  a.href = url;\\n  a.download = \\'pagespeed-report.html\\';\\n  a.click();\\n})';
            } else if (isFull) {
                responseHandler = '.then(response => response.json())\\n.then(data => {\\n  console.log(\\'Full analysis data:\\', data);\\n  // Access HTML report: data.html_report\\n  // Access JSON analysis: data (all other fields)\\n})';
            } else if (isHtmlJson) {
                responseHandler = '.then(response => response.json())\\n.then(data => {\\n  console.log(\\'Structured report data:\\', data);\\n  // Access report data: data.report_data\\n  // Access scores: data.report_data.category_scores\\n  // Access recommendations: data.report_data.categories\\n})';
            } else {
                responseHandler = '.then(response => response.json())\\n.then(data => console.log(data))';
            }
            
            const fetchCommand = 'fetch(\\'' + baseUrl + '/' + endpoint + '\\', {\\n' +
                '  method: \\'POST\\',\\n' +
                '  headers: {\\n' +
                '    \\'Content-Type\\': \\'application/json\\'\\n' +
                '  },\\n' +
                '  body: JSON.stringify(' + JSON.stringify(data, null, 2) + ')\\n' +
                '})\\n' +
                responseHandler + '\\n' +
                '.catch(error => console.error(\\'Error:\\', error));';
            document.getElementById('fetchCommand').textContent = fetchCommand;
            
            // Python requests
            let pythonResponseHandler;
            if (isReport) {
                pythonResponseHandler = 'html_content = response.text()\\nprint("HTML Report generated successfully")\\n# Save report to file\\nwith open("pagespeed-report.html", "w", encoding="utf-8") as f:\\n    f.write(html_content)\\nprint("Report saved as pagespeed-report.html")';
            } else if (isFull) {
                pythonResponseHandler = 'result = response.json()\\nprint("Full analysis completed successfully")\\n# Access HTML report: result["html_report"]\\n# Access JSON analysis: result (all other fields)\\nprint(f"Analysis contains {len(result)} fields")\\nprint("HTML report length:", len(result.get("html_report", "")))';
            } else if (isHtmlJson) {
                pythonResponseHandler = 'result = response.json()\\nprint("Structured report data received successfully")\\n# Access report data: result["report_data"]\\n# Access scores: result["report_data"]["category_scores"]\\n# Access recommendations: result["report_data"]["categories"]\\nprint(f"Overall score: {result[\\'report_data\\'][\\'overall_score\\'][\\'value\\']}")\\nprint(f"Total issues: {result[\\'report_data\\'][\\'optimization_summary\\'][\\'total_issues\\']}")\\nprint(json.dumps(result["report_data"]["optimization_summary"], indent=2))';
            } else {
                pythonResponseHandler = 'result = response.json()\\nprint(json.dumps(result, indent=2))';
            }
            
            const pythonCommand = 'import requests\\n' +
                'import json\\n\\n' +
                'url = "' + baseUrl + '/' + endpoint + '"\\n' +
                'data = ' + JSON.stringify(data, null, 2) + '\\n\\n' +
                'response = requests.post(url, json=data)\\n' +
                pythonResponseHandler;
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
            
            // Check if the modern Clipboard API is available
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    button.textContent = 'Copied!';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy with Clipboard API: ', err);
                    // Fall back to the legacy method
                    fallbackCopy(text, button, originalText);
                });
            } else {
                // Use fallback method directly
                fallbackCopy(text, button, originalText);
            }
            
            function fallbackCopy(text, button, originalText) {
                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    button.textContent = 'Copied!';
                    button.classList.add('copied');
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy with fallback method: ', err);
                    button.textContent = 'Copy failed';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                }
            }
        }
        
        function toggleExpandableSection(sectionId) {
            const content = document.getElementById('fullResponseContent');
            const toggle = document.getElementById('fullResponseToggle');
            
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                toggle.classList.remove('expanded');
            } else {
                content.classList.add('expanded');
                toggle.classList.add('expanded');
            }
        }
        
        function updateResponseStats(content) {
            const responseStats = document.getElementById('responseStats');
            const responseSize = document.getElementById('responseSize');
            const responseLines = document.getElementById('responseLines');
            
            if (content) {
                const sizeInBytes = new Blob([content]).size;
                const sizeInKB = (sizeInBytes / 1024).toFixed(1);
                const lineCount = content.split('\\n').length;
                
                responseSize.textContent = sizeInKB + ' KB';
                responseLines.textContent = lineCount.toLocaleString() + ' lines';
                responseStats.style.display = 'flex';
            }
        }
        
        let progressInterval;
        let startTime;
        
        function startProgressBar(isReport = false) {
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            const progressTime = document.getElementById('progressTime');
            const loadingTitle = document.getElementById('loadingTitle');
            
            startTime = Date.now();
            let progress = 0;
            const maxTime = 120000; // 2 minutes in milliseconds
            
            loadingTitle.textContent = isReport ? '📄 Generating HTML report...' : '🔄 Analyzing performance...';
            
            const progressSteps = [
                { progress: 10, text: 'Connecting to PageSpeed Insights API...' },
                { progress: 25, text: 'Running Lighthouse analysis...' },
                { progress: 45, text: 'Collecting Core Web Vitals data...' },
                { progress: 65, text: 'Processing CrUX history data...' },
                { progress: 80, text: 'Generating Azion recommendations...' },
                { progress: 95, text: isReport ? 'Compiling HTML report...' : 'Finalizing analysis...' }
            ];
            
            let stepIndex = 0;
            
            progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const elapsedSeconds = Math.floor(elapsed / 1000);
                const estimatedTotal = 120;
                
                // Update progress based on time and steps
                if (stepIndex < progressSteps.length) {
                    const currentStep = progressSteps[stepIndex];
                    const timeProgress = (elapsed / maxTime) * 100;
                    
                    if (timeProgress >= currentStep.progress || elapsedSeconds > stepIndex * 15) {
                        progress = currentStep.progress;
                        progressText.textContent = currentStep.text;
                        stepIndex++;
                    }
                }
                
                progressBar.style.width = progress + '%';
                progressTime.textContent = \`Elapsed: \${elapsedSeconds}s / Est. \${estimatedTotal}s\`;
                
                // If we've been running for more than 2 minutes, show warning
                if (elapsed > maxTime) {
                    progressText.textContent = 'Analysis taking longer than expected...';
                    progressTime.textContent = \`Elapsed: \${elapsedSeconds}s (Extended processing)\`;
                }
            }, 500);
        }
        
        function stopProgressBar() {
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
        }
        
        async function performAnalysis(endpoint, endpointType) {
            const data = getCurrentRequestData();
            
            // Hide previous results
            error.style.display = 'none';
            result.classList.remove('show');
            loading.style.display = 'block';
            
            // Start progress bar
            const isReport = endpointType === 'report';
            const isFull = endpointType === 'full';
            const isHtmlJson = endpointType === 'html-json';
            startProgressBar(isReport || isFull || isHtmlJson);
            
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                stopProgressBar();
                
                if (isReport) {
                    if (response.ok) {
                        const htmlContent = await response.text();
                        displayHtmlReportResult(htmlContent, data);
                    } else {
                        throw new Error('Failed to generate report');
                    }
                    return;
                }
                
                const responseData = await response.json();
                
                if (!response.ok) {
                    throw new Error(responseData.message || 'Analysis failed');
                }
                
                if (isFull) {
                    displayFullAnalysisResult(responseData, data);
                } else if (isHtmlJson) {
                    displayHtmlJsonResult(responseData, data);
                } else {
                    displayResults(responseData, data);
                }
                
            } catch (err) {
                stopProgressBar();
                loading.style.display = 'none';
                error.style.display = 'block';
                error.textContent = 'Error: ' + err.message;
            }
        }
        
        function displayHtmlReportResult(htmlContent, requestData) {
            loading.style.display = 'none';
            result.classList.add('show');
            
            // Create a blob URL for the HTML content
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const reportUrl = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = \`pagespeed-report-\${requestData.url.replace(/[^a-zA-Z0-9]/g, '-')}-\${timestamp}.html\`;
            
            // Calculate file size
            const sizeInBytes = blob.size;
            const sizeInKB = (sizeInBytes / 1024).toFixed(1);
            const sizeInMB = sizeInBytes > 1024 * 1024 ? (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB' : sizeInKB + ' KB';
            
            // Display HTML report result
            document.getElementById('summaryContent').innerHTML = \`
                <div style="text-align: center; padding: 20px;">
                    <h4 style="color: #34A853; margin-bottom: 15px;">📄 HTML Report Generated Successfully!</h4>
                    <p style="color: #CCC; margin-bottom: 20px;">
                        Report generated for <strong style="color: #F3652B;">\${requestData.url}</strong> 
                        on <strong>\${requestData.device}</strong> device.
                    </p>
                    <div class="report-actions">
                        <a href="\${reportUrl}" target="_blank" class="report-link">
                            🔗 Open Report in New Tab
                        </a>
                        <a href="\${reportUrl}" download="\${filename}" class="report-link" style="background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);">
                            💾 Download Report (\${sizeInMB})
                        </a>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 15px;">
                        The report contains detailed performance analysis, recommendations, and interactive charts.
                    </p>
                </div>
            \`;
            
            // Show the full HTML content in the response section
            document.getElementById('responseData').textContent = htmlContent;
            updateResponseStats(htmlContent);
        }
        
        function displayFullAnalysisResult(responseData, requestData) {
            loading.style.display = 'none';
            result.classList.add('show');
            
            // Create downloadable JSON file
            const jsonBlob = new Blob([JSON.stringify(responseData, null, 2)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            
            // Create downloadable HTML file
            const htmlBlob = new Blob([responseData.html_report], { type: 'text/html' });
            const htmlUrl = URL.createObjectURL(htmlBlob);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const jsonFilename = \`pagespeed-full-analysis-\${responseData.url.replace(/[^a-zA-Z0-9]/g, '-')}-\${timestamp}.json\`;
            const htmlFilename = \`pagespeed-report-\${responseData.url.replace(/[^a-zA-Z0-9]/g, '-')}-\${timestamp}.html\`;
            
            // Calculate file sizes
            const jsonSizeInBytes = jsonBlob.size;
            const jsonSizeInKB = (jsonSizeInBytes / 1024).toFixed(1);
            const jsonSizeFormatted = jsonSizeInBytes > 1024 * 1024 ? (jsonSizeInBytes / (1024 * 1024)).toFixed(1) + ' MB' : jsonSizeInKB + ' KB';
            
            const htmlSizeInBytes = htmlBlob.size;
            const htmlSizeInKB = (htmlSizeInBytes / 1024).toFixed(1);
            const htmlSizeFormatted = htmlSizeInBytes > 1024 * 1024 ? (htmlSizeInBytes / (1024 * 1024)).toFixed(1) + ' MB' : htmlSizeInKB + ' KB';
            
            // Summary for full analysis
            const summary = responseData.azion_recommendations.marketing_data.summary;
            document.getElementById('summaryContent').innerHTML = \`
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-value">\${summary.total_issues}</div>
                        <div class="summary-label">Total Issues</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #EA4335;">\${summary.high_priority_issues}</div>
                        <div class="summary-label">High Priority</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #34A853;">\${responseData.azion_recommendations.solution_count}</div>
                        <div class="summary-label">Azion Solutions</div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <h4 style="color: #F3652B; margin-bottom: 10px;">📊 Full Analysis Complete!</h4>
                    <p style="color: #CCC; margin-bottom: 15px;">
                        Combined JSON analysis and HTML report for <strong style="color: #F3652B;">\${responseData.url}</strong> 
                        on <strong>\${responseData.device}</strong> device.
                    </p>
                    <div class="report-actions">
                        <a href="\${jsonUrl}" download="\${jsonFilename}" class="report-link" style="background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);">
                            💾 Download Full JSON (\${jsonSizeFormatted})
                        </a>
                        <a href="\${htmlUrl}" download="\${htmlFilename}" class="report-link" style="background: linear-gradient(135deg, #34A853 0%, #4CAF50 100%);">
                            📄 Download HTML Report (\${htmlSizeFormatted})
                        </a>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 15px;">
                        This response includes both the complete JSON analysis data and the HTML report in the 'html_report' field.
                    </p>
                </div>
            \`;
            
            // Show full JSON response without truncation
            const jsonString = JSON.stringify(responseData, null, 2);
            document.getElementById('responseData').textContent = jsonString;
            updateResponseStats(jsonString);
        }
        
        function displayHtmlJsonResult(responseData, requestData) {
            loading.style.display = 'none';
            result.classList.add('show');
            
            // Create downloadable JSON file
            const jsonBlob = new Blob([JSON.stringify(responseData, null, 2)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = \`pagespeed-structured-data-\${responseData.url.replace(/[^a-zA-Z0-9]/g, '-')}-\${timestamp}.json\`;
            
            // Calculate file size
            const sizeInBytes = jsonBlob.size;
            const sizeInKB = (sizeInBytes / 1024).toFixed(1);
            const sizeFormatted = sizeInBytes > 1024 * 1024 ? (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB' : sizeInKB + ' KB';
            
            // Summary for structured data response
            const reportData = responseData.report_data;
            const optimizationSummary = reportData.optimization_summary;
            
            document.getElementById('summaryContent').innerHTML = \`
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-value">\${reportData.overall_score.value}</div>
                        <div class="summary-label">Overall Score</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #EA4335;">\${optimizationSummary.total_issues}</div>
                        <div class="summary-label">Total Issues</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #FBBC04;">\${optimizationSummary.high_priority_issues}</div>
                        <div class="summary-label">High Priority</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #34A853;">\${optimizationSummary.azion_solutions_count}</div>
                        <div class="summary-label">Azion Solutions</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #1976D2;">\${reportData.categories.length}</div>
                        <div class="summary-label">Categories</div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <h4 style="color: #F3652B; margin-bottom: 10px;">📋 Structured Report Data Complete!</h4>
                    <p style="color: #CCC; margin-bottom: 15px;">
                        Structured data values for <strong style="color: #F3652B;">\${responseData.url}</strong> 
                        on <strong>\${responseData.device}</strong> device.
                    </p>
                    <div class="report-actions">
                        <a href="\${jsonUrl}" download="\${filename}" class="report-link" style="background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);">
                            💾 Download Structured Data (\${sizeFormatted})
                        </a>
                    </div>
                    <div style="background: #0D0D0D; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h5 style="color: #34A853; margin-bottom: 10px;">📊 Data Structure Overview</h5>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 12px;">
                            <div style="color: #CCC;">• Header information</div>
                            <div style="color: #CCC;">• Overall & category scores</div>
                            <div style="color: #CCC;">• Optimization summary</div>
                            <div style="color: #CCC;">• Detailed recommendations</div>
                            <div style="color: #CCC;">• Console errors data</div>
                            <div style="color: #CCC;">• CrUX metrics (if available)</div>
                        </div>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 15px;">
                        JSON response contains all structured data values used to populate the HTML report for programmatic access.
                    </p>
                </div>
            \`;
            
            // Show full JSON response without truncation
            const jsonString = JSON.stringify(responseData, null, 2);
            document.getElementById('responseData').textContent = jsonString;
            updateResponseStats(jsonString);
        }
        
        function displayResults(responseData, requestData) {
            loading.style.display = 'none';
            result.classList.add('show');
            
            // Create downloadable JSON file
            const jsonBlob = new Blob([JSON.stringify(responseData, null, 2)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = \`pagespeed-analysis-\${responseData.url.replace(/[^a-zA-Z0-9]/g, '-')}-\${timestamp}.json\`;
            
            // Calculate file size
            const sizeInBytes = jsonBlob.size;
            const sizeInKB = (sizeInBytes / 1024).toFixed(1);
            const sizeFormatted = sizeInBytes > 1024 * 1024 ? (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB' : sizeInKB + ' KB';
            
            // Summary
            const summary = responseData.azion_recommendations.marketing_data.summary;
            document.getElementById('summaryContent').innerHTML = \`
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-value">\${summary.total_issues}</div>
                        <div class="summary-label">Total Issues</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #EA4335;">\${summary.high_priority_issues}</div>
                        <div class="summary-label">High Priority</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value" style="color: #34A853;">\${responseData.azion_recommendations.solution_count}</div>
                        <div class="summary-label">Azion Solutions</div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <h4 style="color: #F3652B; margin-bottom: 10px;">🔍 JSON Analysis Complete!</h4>
                    <p style="color: #CCC; margin-bottom: 15px;">
                        Analysis completed for <strong style="color: #F3652B;">\${responseData.url}</strong> 
                        on <strong>\${responseData.device}</strong> device.
                    </p>
                    <div class="report-actions">
                        <a href="\${jsonUrl}" download="\${filename}" class="report-link" style="background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);">
                            💾 Download JSON Analysis (\${sizeFormatted})
                        </a>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 15px;">
                        Complete JSON analysis with recommendations and Azion solutions.
                    </p>
                </div>
            \`;
            
            // Full response without truncation
            const jsonString = JSON.stringify(responseData, null, 2);
            document.getElementById('responseData').textContent = jsonString;
            updateResponseStats(jsonString);
        }
    </script>
</body>
</html>`;

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
      'POST /analyze': {
        description: 'Analyze website performance and get Azion recommendations',
        body: {
          url: 'string (required) - Website URL to analyze (https:// added automatically if not provided)',
          api_key: 'string (optional) - PageSpeed Insights API key (uses PAGESPEED_INSIGHTS_API_KEY env var if not provided)',
          device: 'string (optional) - mobile|desktop|tablet (default: mobile)',
          use_crux: 'boolean (optional) - Include CrUX history data (default: false)',
          weeks: 'number (optional) - CrUX history weeks 1-40 (default: 25)'
        },
        response: 'JSON object with analysis results, recommendations, and HTML report'
      },
      'POST /report': {
        description: 'Generate and return HTML performance report',
        body: 'Same as /analyze endpoint',
        response: 'HTML document with comprehensive performance report'
      },
      'POST /full': {
        description: 'Get complete JSON analysis with embedded HTML report',
        body: 'Same as /analyze endpoint',
        response: 'JSON object with full analysis data plus html_report field containing the HTML report'
      },
      'POST /html-json': {
        description: 'Get structured data values that populate the HTML report in JSON format',
        body: 'Same as /analyze endpoint',
        response: 'JSON object containing report_data with scores, recommendations, categories, and all structured values used in HTML generation'
      },
      'GET /manual': {
        description: 'Interactive web interface for manual testing',
        response: 'HTML interface with forms and examples'
      },
      'GET /health': {
        description: 'Health check endpoint',
        response: 'JSON status object'
      },
      'GET /docs': {
        description: 'API documentation',
        response: 'This documentation'
      }
    },
    examples: {
      curl: `curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "example.com",
    "device": "mobile",
    "use_crux": true,
    "weeks": 25
  }' \\
  ${req.protocol}://${req.get('host')}/analyze`,
      
      javascript: `fetch('${req.protocol}://${req.get('host')}/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'example.com',
    device: 'mobile',
    use_crux: true,
    weeks: 25
  })
})
.then(response => response.json())
.then(data => console.log(data));`
    }
  };

  res.json(docs);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Azion PageSpeed Analyzer API running on port ${port}`);
  console.log(`📖 Documentation: http://localhost:${port}/docs`);
  console.log(`🔧 Manual Interface: http://localhost:${port}/manual`);
  console.log(`❤️ Health Check: http://localhost:${port}/health`);
});

export default app;
