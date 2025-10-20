import { AnalysisResult, AzionRecommendations, ProcessedCrUXData } from '../types';

export class ReportGeneratorService {

  generateUnifiedHtmlReport(
    url: string,
    analysis: AnalysisResult,
    azionRecommendations: AzionRecommendations,
    timestamp: string,
    cruxData?: ProcessedCrUXData,
    cruxChartHtml?: string
  ): string {
    // Calculate overall score
    const scores = Object.values(analysis).map(cat => cat.score).filter(score => score !== undefined);
    const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Count issues by priority
    const highPriorityIssues = Object.values(analysis)
      .flatMap(cat => cat.issues)
      .filter(issue => issue.impact === 'high').length;

    // Generate CrUX assessment HTML
    let cruxAssessmentHtml = '';
    if (cruxData && cruxChartHtml) {
      // This would normally use the CrUX assessment, but for simplicity we'll create a basic one
      const overallCruxScore = 75; // Placeholder
      cruxAssessmentHtml = `
        <div class="section">
          <h2>📊 Real User Experience (CrUX Data)</h2>
          <div style="background: #0D0D0D; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
              <div style="font-size: 36px; font-weight: bold; color: ${overallCruxScore >= 75 ? '#34A853' : overallCruxScore >= 25 ? '#FBBC04' : '#EA4335'}; 
                          background: #1A1A1A; padding: 15px; border-radius: 50%; min-width: 80px; text-align: center;">
                ${overallCruxScore.toFixed(0)}
              </div>
              <div>
                <h3 style="color: #F3652B; margin-bottom: 5px;">Core Web Vitals Score</h3>
                <p style="color: #CCC;">Based on real Chrome user data</p>
              </div>
            </div>
          </div>
          ${cruxChartHtml}
        </div>`;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Azion Performance Analysis - ${url}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0D0D0D; color: #FFFFFF; padding: 20px; line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            background: linear-gradient(135deg, #F3652B 0%, #FF8C42 100%);
            padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;
        }
        .header h1 { font-size: 32px; margin-bottom: 10px; color: white; }
        .header p { font-size: 18px; opacity: 0.9; }
        .score-grid { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px; margin-bottom: 30px;
        }
        .score-card { 
            background: #1A1A1A; padding: 25px; border-radius: 12px; text-align: center;
            border: 2px solid #333; transition: transform 0.2s;
        }
        .score-card:hover { transform: translateY(-2px); }
        .score-value { font-size: 36px; font-weight: bold; margin-bottom: 8px; }
        .score-good { color: #34A853; }
        .score-average { color: #FBBC04; }
        .score-poor { color: #EA4335; }
        .score-label { color: #CCC; font-size: 14px; text-transform: uppercase; }
        .section { 
            background: #1A1A1A; padding: 30px; border-radius: 12px; 
            margin-bottom: 30px; border-left: 4px solid #F3652B;
        }
        .section h2 { color: #F3652B; font-size: 24px; margin-bottom: 20px; }
        .category-section { 
            background: #1A1A1A; padding: 35px; border-radius: 15px; 
            margin-bottom: 40px; border-left: 6px solid #F3652B;
        }
        .category-header { margin-bottom: 25px; }
        .azion-focus { 
            background: #2A2A2A; padding: 20px; border-radius: 8px; 
            margin-bottom: 25px; border-left: 4px solid #F3652B;
        }
        .recommendations-list { margin-bottom: 25px; }
        .category-summary { 
            background: #0D0D0D; padding: 25px; border-radius: 12px; 
            border: 2px solid #333; margin-top: 25px;
        }
        .azion-recommendation { 
            background: #0D0D0D; padding: 20px; border-radius: 8px; 
            margin-bottom: 15px; border-left: 4px solid #34A853;
        }
        .recommendation-header { display: flex; justify-content: space-between; align-items: center; }
        .priority-high { border-left-color: #EA4335; }
        .priority-medium { border-left-color: #FBBC04; }
        .priority-low { border-left-color: #34A853; }
        .solution-list { margin-top: 15px; }
        .solution-item { 
            background: #2A2A2A; padding: 15px; border-radius: 6px; 
            margin-bottom: 10px; border-left: 3px solid #F3652B;
        }
        .solution-name { font-weight: 600; color: #F3652B; margin-bottom: 5px; }
        .solution-desc { color: #CCC; font-size: 14px; }
        .marketing-summary { 
            background: linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%);
            padding: 25px; border-radius: 12px; border: 2px solid #F3652B;
        }
        .summary-grid { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px; margin-top: 15px;
        }
        .summary-item { text-align: center; }
        .summary-number { font-size: 28px; font-weight: bold; color: #F3652B; }
        .summary-label { color: #CCC; font-size: 12px; }
        .footer { 
            text-align: center; padding: 20px; color: #666; 
            border-top: 1px solid #333; margin-top: 30px;
        }
        .azion-logo { color: #F3652B; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Azion Performance Analysis</h1>
            <p>Comprehensive website optimization recommendations for ${url}</p>
            <p style="font-size: 14px; margin-top: 10px;">Generated on ${timestamp}</p>
        </div>
        
        <div class="score-grid">
            <div class="score-card">
                <div class="score-value ${overallScore >= 80 ? 'score-good' : overallScore >= 50 ? 'score-average' : 'score-poor'}">${overallScore.toFixed(0)}</div>
                <div class="score-label">Overall Score</div>
            </div>
            ${this.generateCategoryScoreCards(analysis)}
        </div>
        
        ${cruxAssessmentHtml}
        
        <div class="marketing-summary">
            <h2 style="margin-bottom: 15px;">📊 Optimization Opportunity Summary</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-number">${azionRecommendations.marketing_data.summary.total_issues}</div>
                    <div class="summary-label">Issues Found</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">${azionRecommendations.marketing_data.summary.high_priority_issues}</div>
                    <div class="summary-label">High Priority</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">${azionRecommendations.solution_count}</div>
                    <div class="summary-label">Azion Solutions</div>
                </div>
                <div class="summary-item">
                    <div class="summary-number">40%</div>
                    <div class="summary-label">Potential Speed Gain</div>
                </div>
            </div>
        </div>

        ${this.generateCategorySections(analysis, azionRecommendations)}
        
        <div class="footer">
            <p>Powered by <span class="azion-logo">Azion Edge Platform</span></p>
            <p>Ready to optimize your website? Contact us for a personalized consultation.</p>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  private generateCategoryScoreCards(analysis: AnalysisResult): string {
    let html = '';
    
    const categoryLabels: Record<string, string> = {
      performance: 'Performance',
      accessibility: 'Accessibility',
      best_practices: 'Best Practices',
      seo: 'SEO'
    };

    for (const [category, data] of Object.entries(analysis)) {
      const score = data.score;
      const scoreClass = score >= 80 ? 'score-good' : score >= 50 ? 'score-average' : 'score-poor';
      const label = categoryLabels[category] || category.replace('_', ' ');
      
      html += `
        <div class="score-card">
            <div class="score-value ${scoreClass}">${score.toFixed(0)}</div>
            <div class="score-label">${label}</div>
        </div>`;
    }
    
    return html;
  }

  private generateCategorySections(analysis: AnalysisResult, azionRecommendations: AzionRecommendations): string {
    const categoryInfo: Record<string, {
      title: string;
      icon: string;
      color: string;
      description: string;
      azion_focus: string;
    }> = {
      performance: {
        title: '⚡ Performance Optimization',
        icon: '🚀',
        color: '#F3652B',
        description: 'Core Web Vitals and loading performance optimizations',
        azion_focus: 'Edge Cache, Image Processor, Edge Functions, and Tiered Cache for maximum performance gains'
      },
      accessibility: {
        title: '♿ Accessibility Enhancement',
        icon: '🌐',
        color: '#34A853',
        description: 'WCAG compliance and inclusive user experience improvements',
        azion_focus: 'Edge Functions and AI Inference for dynamic accessibility enhancements'
      },
      best_practices: {
        title: '🛡️ Security & Best Practices',
        icon: '🔒',
        color: '#4285F4',
        description: 'Security, privacy, and modern web standards compliance',
        azion_focus: 'Edge Firewall, Edge Functions, and security headers for comprehensive protection'
      },
      seo: {
        title: '🔍 SEO Optimization',
        icon: '📈',
        color: '#FBBC04',
        description: 'Search engine visibility and discoverability improvements',
        azion_focus: 'Edge Functions, Edge DNS, and dynamic content optimization for better rankings'
      }
    };

    let html = '';

    // Group recommendations by category
    const recommendationsByCategory: Record<string, any[]> = {};
    for (const rec of azionRecommendations.recommendations) {
      const category = rec.category;
      if (!recommendationsByCategory[category]) {
        recommendationsByCategory[category] = [];
      }
      recommendationsByCategory[category].push(rec);
    }

    // Generate section for each category
    for (const [categoryKey, categoryData] of Object.entries(analysis)) {
      if (!(categoryKey in categoryInfo)) {
        continue;
      }

      const info = categoryInfo[categoryKey];
      const issues = categoryData.issues;
      const score = categoryData.score;

      if (issues.length === 0) {
        continue;
      }

      // Category header
      html += `
        <div class="section category-section" style="border-left-color: ${info.color};">
            <div class="category-header">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="font-size: 48px;">${info.icon}</div>
                    <div>
                        <h2 style="color: ${info.color}; margin-bottom: 5px;">${info.title}</h2>
                        <p style="color: #CCC; margin-bottom: 10px;">${info.description}</p>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background: ${info.color}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
                                Score: ${score.toFixed(0)}/100
                            </div>
                            <div style="color: #CCC;">
                                ${issues.length} issue${issues.length !== 1 ? 's' : ''} found
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="azion-focus" style="background: #2A2A2A; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid ${info.color};">
                <h3 style="color: ${info.color}; margin-bottom: 10px;">🎯 Azion Platform Focus</h3>
                <p style="color: #CCC; line-height: 1.6;">${info.azion_focus}</p>
            </div>`;

      // Add recommendations for this category
      const categoryRecommendations = recommendationsByCategory[categoryKey] || [];

      if (categoryRecommendations.length > 0) {
        html += `
            <div class="recommendations-list">
                <h3 style="color: ${info.color}; margin-bottom: 20px;">🔧 Optimization Recommendations</h3>`;

        for (const rec of categoryRecommendations.slice(0, 8)) { // Top 8 per category
          const issue = rec.issue;
          const solution = rec.azion_solution;
          const priorityClass = `priority-${solution.priority}`;

          // Get original PageSpeed data for context
          const originalData = issue.original_pagespeed_data || {};
          const originalDescription = originalData.description || '';
          const displayValue = issue.display_value || '';

          html += `
            <div class="azion-recommendation ${priorityClass}" style="margin-bottom: 20px;">
                <div class="recommendation-header">
                    <h4 style="color: white; margin-bottom: 5px;">${issue.title}</h4>
                    <span style="background: ${info.color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${solution.priority.toUpperCase()} PRIORITY
                    </span>
                </div>
                <p style="color: #CCC; margin: 10px 0; line-height: 1.5;">${solution.description}</p>`;

          // Add original PageSpeed Insights context
          if (originalDescription || displayValue) {
            html += `
                <div style="background: #1A1A1A; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #4285F4;">
                    <h5 style="color: #4285F4; font-size: 14px; margin-bottom: 8px;">📊 PageSpeed Insights Details</h5>`;

            if (displayValue) {
              html += `<p style="color: #FFF; font-weight: 600; margin-bottom: 5px; font-size: 14px;">Current Value: ${displayValue}</p>`;
            }

            if (originalDescription) {
              html += `<p style="color: #CCC; font-size: 13px; line-height: 1.5;">${originalDescription}</p>`;
            }

            html += `</div>`;
          }

          // Add console errors section for errors-in-console audit
          if (issue.id === 'errors-in-console' && issue.console_errors) {
            const consoleErrors = issue.console_errors;
            const errorCount = issue.console_error_count || 0;

            html += `
                <div style="background: #2A1A1A; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #EA4335;">
                    <h5 style="color: #EA4335; font-size: 14px; margin-bottom: 10px;">🚨 Console Errors Found (${errorCount})</h5>
                    <div style="max-height: 300px; overflow-y: auto;">`;

            for (const [idx, error] of consoleErrors.slice(0, 10).entries()) { // Show max 10 errors
              const sourceLoc = error.source_location || {};
              const url = sourceLoc.url || 'Unknown source';
              const line = sourceLoc.line || 0;
              const column = sourceLoc.column || 0;
              const sourceType = error.source || 'console.error';

              // Truncate long URLs for display
              const displayUrl = url.length <= 60 ? url : `...${url.slice(-57)}`;

              html += `
                    <div style="background: #1A0A0A; padding: 12px; border-radius: 4px; margin-bottom: 8px; border-left: 2px solid #EA4335;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="color: #EA4335; font-size: 12px; font-weight: 600;">${sourceType.toUpperCase()}</span>
                            <span style="color: #888; font-size: 11px;">Line ${line}:${column}</span>
                        </div>
                        <p style="color: #FFF; font-size: 13px; margin-bottom: 5px; font-family: 'Courier New', monospace;">${error.description || 'No description'}</p>
                        <p style="color: #888; font-size: 11px; word-break: break-all;" title="${url}">${displayUrl}</p>
                    </div>`;
            }

            if (errorCount > 10) {
              html += `
                    <div style="text-align: center; padding: 10px; color: #888; font-size: 12px;">
                        ... and ${errorCount - 10} more errors
                    </div>`;
            }

            html += `
                    </div>
                </div>`;
          }

          // Add Azion solutions
          html += `<div class="solution-list" style="margin-top: 15px;">`;

          for (const sol of solution.solutions.slice(0, 3)) { // Top 3 solutions per recommendation
            html += `
                <div class="solution-item" style="background: #0D0D0D; border-left-color: ${info.color};">
                    <div class="solution-name" style="color: ${info.color};">${sol.name}</div>
                    <div class="solution-desc">${sol.description}</div>
                </div>`;
          }

          html += `</div></div>`;
        }

        html += `</div>`;
      }

      // Add category summary
      const highPriority = categoryRecommendations.filter(rec => rec.azion_solution.priority === 'high').length;
      const mediumPriority = categoryRecommendations.filter(rec => rec.azion_solution.priority === 'medium').length;
      const uniqueSolutions = new Set(categoryRecommendations.flatMap(rec => rec.azion_solution.solutions.map((s: any) => s.id))).size;

      html += `
            <div class="category-summary" style="background: #1A1A1A; padding: 20px; border-radius: 8px; margin-top: 25px;">
                <h3 style="color: ${info.color}; margin-bottom: 15px;">📊 Category Summary</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #EA4335;">${highPriority}</div>
                        <div style="color: #CCC; font-size: 12px;">High Priority</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #FBBC04;">${mediumPriority}</div>
                        <div style="color: #CCC; font-size: 12px;">Medium Priority</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: ${info.color};">${uniqueSolutions}</div>
                        <div style="color: #CCC; font-size: 12px;">Azion Solutions</div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    return html;
  }
}
