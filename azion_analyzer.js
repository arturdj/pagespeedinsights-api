#!/usr/bin/env node

/**
 * Azion PageSpeed Analyzer - Simplified Marketing-Focused Tool
 *
 * Main Goals:
 * - Interactive CLI and argument-based usage
 * - Map PageSpeed issues to Azion Platform solutions
 * - Generate unified HTML reports with Azion recommendations
 * - Output JSON for marketing campaigns
 * - Robust error handling with best-effort approach
 */

import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { Command } from 'commander';
import dotenv from 'dotenv';
import open from 'open';
import readlineSync from 'readline-sync';
import {
    getAzionSolutionsForAudit,
    generateMarketingCampaignData,
    formatMarketingPitch
} from './azion_solutions.js';
import {
    getCruxHistory,
    extractPagespeedCoreVitals,
    processCruxData,
    createCoreVitalsChart,
    assessCruxPerformance
} from './crux_integration.js';

// Load environment variables
dotenv.config();

// Configuration
const REPORTS_DIR = './reports';
const API_TIMEOUT = 120000; // 120 seconds

/**
 * Create reports directory if it doesn't exist
 */
async function ensureReportsDirectory() {
    await fs.ensureDir(REPORTS_DIR);
}

/**
 * Get API key with user-friendly error handling
 * @returns {string|null} API key or null if not found
 */
function getApiKey() {
    const apiKey = process.env.PAGESPEED_INSIGHTS_API_KEY;
    if (!apiKey) {
        console.log("❌ Error: PageSpeed Insights API key not found");
        console.log("\nSetup instructions:");
        console.log("1. Get API key from: https://console.cloud.google.com/");
        console.log("2. Enable PageSpeed Insights API and CrUX API");
        console.log("3. Set: export PAGESPEED_INSIGHTS_API_KEY='your-key'");
        return null;
    }
    return apiKey;
}

/**
 * Interactive CLI for user-friendly operation
 * @returns {Object} Configuration object
 */
function interactiveMode() {
    console.log("\n🚀 Azion PageSpeed Analyzer");
    console.log("=".repeat(40));
    
    // Get URL
    let url;
    while (true) {
        url = readlineSync.question("\n🌐 Enter website URL: ").trim();
        if (url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            break;
        }
        console.log("❌ URL required");
    }
    
    // Analysis type
    console.log("\n📊 Analysis type:");
    console.log("1. PageSpeed only (fast)");
    console.log("2. CrUX + PageSpeed (comprehensive)");
    
    let choice;
    while (true) {
        choice = readlineSync.question("Choice (1/2): ").trim();
        if (choice === '1' || choice === '2') {
            break;
        }
        console.log("❌ Enter 1 or 2");
    }
    
    const useCrux = choice === '2';
    
    // Device type
    let device = 'mobile';
    if (useCrux) {
        console.log("\n📱 Device:");
        console.log("1. Mobile  2. Desktop  3. Tablet");
        const deviceChoice = readlineSync.question("Choice (1/2/3): ").trim();
        const deviceMap = { '1': 'mobile', '2': 'desktop', '3': 'tablet' };
        device = deviceMap[deviceChoice] || 'mobile';
    }
    
    const openBrowser = readlineSync.question("\n🌐 Open report? (y/N): ").toLowerCase() === 'y';
    
    let weeks = 25;
    if (useCrux) {
        const weeksInput = readlineSync.question(`\n📅 CrUX history weeks (1-40, default ${weeks}): `).trim();
        if (weeksInput && !isNaN(weeksInput)) {
            weeks = Math.max(1, Math.min(parseInt(weeksInput), 40));
        }
    }
    
    return {
        url,
        useCrux,
        device,
        weeks,
        openBrowser
    };
}

/**
 * Fetch PageSpeed Insights data
 * @param {string} apiKey - Google API key
 * @param {string} url - URL to analyze
 * @param {string} strategy - Device strategy (mobile/desktop)
 * @returns {Object} PageSpeed Insights response
 */
async function getPagespeedInsights(apiKey, url, strategy = 'mobile') {
    const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const params = {
        url,
        key: apiKey,
        strategy,
        category: ['performance', 'seo', 'accessibility', 'best-practices']
    };
    
    try {
        const response = await axios.get(endpoint, { 
            params, 
            timeout: API_TIMEOUT 
        });
        return response.data;
    } catch (error) {
        return { error: { message: `API error: ${error.message}` } };
    }
}

/**
 * Analyze PageSpeed data and extract actionable insights
 * @param {Object} pagespeedData - PageSpeed Insights response
 * @returns {Object|null} Analysis results
 */
function analyzePagespeedData(pagespeedData) {
    if (pagespeedData.error) {
        return null;
    }
    
    try {
        const lighthouseResult = pagespeedData.lighthouseResult || {};
        const audits = lighthouseResult.audits || {};
        const categories = lighthouseResult.categories || {};
        
        const analysis = {
            performance: { 
                score: (categories.performance?.score || 0) * 100, 
                issues: [] 
            },
            accessibility: { 
                score: (categories.accessibility?.score || 0) * 100, 
                issues: [] 
            },
            best_practices: { 
                score: (categories['best-practices']?.score || 0) * 100, 
                issues: [] 
            },
            seo: { 
                score: (categories.seo?.score || 0) * 100, 
                issues: [] 
            }
        };
        
        // Process audits and map to categories
        for (const [auditId, audit] of Object.entries(audits)) {
            const score = audit.score;
            if (score === null || score >= 0.9) {
                continue;
            }
                
            const auditInfo = {
                id: auditId,
                title: audit.title || '',
                description: audit.description || '',
                score,
                displayValue: audit.displayValue || '',
                impact: score < 0.5 ? 'high' : 'medium',
                originalPagespeedData: {
                    description: audit.description || '',
                    explanation: audit.explanation || '',
                    scoreDisplayMode: audit.scoreDisplayMode || '',
                    numericValue: audit.numericValue,
                    numericUnit: audit.numericUnit || '',
                    details: audit.details || {},
                    warnings: audit.warnings || []
                }
            };
            
            // Extract console error details for errors-in-console audit
            if (auditId === 'errors-in-console') {
                const consoleErrors = [];
                const details = audit.details || {};
                const items = details.items || [];
                
                for (const item of items) {
                    const errorInfo = {
                        description: item.description || '',
                        source: item.source || '',
                        sourceLocation: item.sourceLocation || {}
                    };
                    consoleErrors.push(errorInfo);
                }
                
                auditInfo.consoleErrors = consoleErrors;
                auditInfo.consoleErrorCount = consoleErrors.length;
            }
            
            // Comprehensive audit categorization
            const performanceAudits = [
                'first-contentful-paint', 'largest-contentful-paint', 'speed-index', 'interactive',
                'total-blocking-time', 'cumulative-layout-shift', 'server-response-time',
                'render-blocking-resources', 'unused-css-rules', 'unused-javascript',
                'modern-image-formats', 'uses-webp-images', 'uses-optimized-images',
                'efficient-animated-content', 'legacy-javascript', 'preload-lcp-image',
                'uses-rel-preconnect', 'uses-rel-preload', 'font-display', 'third-party-summary',
                'bootup-time', 'mainthread-work-breakdown', 'dom-size', 'critical-request-chains',
                'user-timings', 'uses-passive-event-listeners', 'no-document-write',
                'uses-http2', 'uses-long-cache-ttl', 'total-byte-weight', 'offscreen-images',
                'unminified-css', 'unminified-javascript', 'unused-css-rules', 'uses-text-compression',
                'redirects', 'uses-responsive-images', 'first-input-delay', 'interaction-to-next-paint'
            ];
            
            const accessibilityAudits = [
                'color-contrast', 'image-alt', 'label', 'link-name', 'button-name', 'form-field-multiple-labels',
                'frame-title', 'duplicate-id-active', 'duplicate-id-aria', 'heading-order',
                'html-has-lang', 'html-lang-valid', 'input-image-alt', 'installable-manifest',
                'is-crawlable', 'lang', 'logical-tab-order', 'managed-focus', 'meta-refresh',
                'meta-viewport', 'object-alt', 'tabindex', 'td-headers-attr', 'th-has-data-cells',
                'valid-lang', 'video-caption', 'video-description', 'focus-traps', 'focusable-controls',
                'interactive-element-affordance', 'use-landmarks', 'aria-allowed-attr', 'aria-command-name',
                'aria-hidden-body', 'aria-hidden-focus', 'aria-input-field-name', 'aria-meter-name',
                'aria-progressbar-name', 'aria-required-attr', 'aria-required-children', 'aria-required-parent',
                'aria-roles', 'aria-toggle-field-name', 'aria-tooltip-name', 'aria-treeitem-name',
                'aria-valid-attr-value', 'aria-valid-attr', 'bypass', 'definition-list', 'dlitem',
                'document-title', 'list', 'listitem', 'skip-link'
            ];
            
            const bestPracticesAudits = [
                'is-on-https', 'no-vulnerable-libraries', 'external-anchors-use-rel-noopener',
                'geolocation-on-start', 'notification-on-start', 'password-inputs-can-be-pasted-into',
                'uses-http2', 'uses-passive-event-listeners', 'no-document-write', 'has-doctype',
                'charset', 'dom-size', 'external-anchors-use-rel-noopener', 'js-libraries',
                'deprecations', 'third-party-cookies', 'inspector-issues', 'csp-xss',
                'unused-javascript', 'modern-image-formats', 'appcache-manifest', 'doctype',
                'no-vulnerable-libraries', 'image-aspect-ratio', 'image-size-responsive',
                'preload-fonts', 'font-display', 'errors-in-console'
            ];
            
            const seoAudits = [
                'viewport', 'document-title', 'meta-description', 'crawlable-anchors', 'is-crawlable',
                'robots-txt', 'hreflang', 'canonical', 'structured-data', 'html-has-lang',
                'html-lang-valid', 'http-status-code', 'link-text', 'plugins', 'tap-targets',
                'font-size', 'legible-font-sizes', 'image-alt', 'video-caption'
            ];
            
            // Categorize audit
            if (performanceAudits.includes(auditId)) {
                analysis.performance.issues.push(auditInfo);
            } else if (accessibilityAudits.includes(auditId)) {
                analysis.accessibility.issues.push(auditInfo);
            } else if (bestPracticesAudits.includes(auditId)) {
                analysis.best_practices.issues.push(auditInfo);
            } else if (seoAudits.includes(auditId)) {
                analysis.seo.issues.push(auditInfo);
            } else {
                // Default to performance if not categorized
                analysis.performance.issues.push(auditInfo);
            }
        }
        
        return analysis;
        
    } catch (error) {
        console.log(`⚠️ Error analyzing PageSpeed data: ${error.message}`);
        return null;
    }
}

/**
 * Generate Azion Platform recommendations based on analysis
 * @param {Object} analysis - PageSpeed analysis results
 * @returns {Object} Azion recommendations and marketing data
 */
function generateAzionRecommendations(analysis) {
    if (!analysis) {
        return { recommendations: [], marketingData: {} };
    }
    
    const recommendations = [];
    const allSolutions = new Set();
    
    for (const [categoryName, categoryData] of Object.entries(analysis)) {
        for (const issue of categoryData.issues || []) {
            const azionSolution = getAzionSolutionsForAudit(issue.id, issue);
            if (azionSolution) {
                recommendations.push({
                    category: categoryName,
                    issue,
                    azionSolution
                });
                for (const solution of azionSolution.solutions) {
                    allSolutions.add(solution.id);
                }
            }
        }
    }
    
    // Generate marketing campaign data
    const marketingData = generateMarketingCampaignData(analysis);
    
    return {
        recommendations,
        marketingData,
        solutionCount: allSolutions.size
    };
}

/**
 * Generate comprehensive category-based sections for the HTML report
 * @param {Object} analysis - PageSpeed analysis results
 * @param {Object} azionRecommendations - Azion recommendations
 * @returns {string} HTML sections
 */
function generateCategorySections(analysis, azionRecommendations) {
    // Category metadata for comprehensive analysis
    const categoryInfo = {
        performance: {
            title: '⚡ Performance Optimization',
            icon: '🚀',
            color: '#F3652B',
            description: 'Core Web Vitals and loading performance optimizations',
            azionFocus: 'Edge Cache, Image Processor, Edge Functions, and Tiered Cache for maximum performance gains'
        },
        accessibility: {
            title: '♿ Accessibility Enhancement', 
            icon: '🌐',
            color: '#34A853',
            description: 'WCAG compliance and inclusive user experience improvements',
            azionFocus: 'Edge Functions and AI Inference for dynamic accessibility enhancements'
        },
        best_practices: {
            title: '🛡️ Security & Best Practices',
            icon: '🔒', 
            color: '#4285F4',
            description: 'Security, privacy, and modern web standards compliance',
            azionFocus: 'Edge Firewall, Edge Functions, and security headers for comprehensive protection'
        },
        seo: {
            title: '🔍 SEO Optimization',
            icon: '📈',
            color: '#FBBC04',
            description: 'Search engine visibility and discoverability improvements',
            azionFocus: 'Edge Functions, Edge DNS, and dynamic content optimization for better rankings'
        }
    };
    
    let html = "";
    
    // Group recommendations by category
    const recommendationsByCategory = {};
    for (const rec of azionRecommendations.recommendations || []) {
        const category = rec.category || 'performance';
        if (!recommendationsByCategory[category]) {
            recommendationsByCategory[category] = [];
        }
        recommendationsByCategory[category].push(rec);
    }
    
    // Generate section for each category
    for (const [categoryKey, categoryData] of Object.entries(analysis)) {
        if (!categoryInfo[categoryKey]) {
            continue;
        }
            
        const info = categoryInfo[categoryKey];
        const issues = categoryData.issues || [];
        const score = categoryData.score || 0;
        
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
                                    Score: ${Math.round(score)}/100
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
                    <p style="color: #CCC; line-height: 1.6;">${info.azionFocus}</p>
                </div>`;
        
        // Add recommendations for this category
        const categoryRecommendations = recommendationsByCategory[categoryKey] || [];
        
        if (categoryRecommendations.length > 0) {
            html += `
                <div class="recommendations-list">
                    <h3 style="color: ${info.color}; margin-bottom: 20px;">🔧 Optimization Recommendations</h3>`;
            
            for (const rec of categoryRecommendations.slice(0, 8)) { // Top 8 per category
                const issue = rec.issue;
                const solution = rec.azionSolution;
                const priorityClass = `priority-${solution.priority}`;
                
                // Get original PageSpeed data for context
                const originalData = issue.originalPagespeedData || {};
                const originalDescription = originalData.description || '';
                const displayValue = issue.displayValue || '';
                
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
                if (issue.id === 'errors-in-console' && issue.consoleErrors) {
                    const consoleErrors = issue.consoleErrors || [];
                    const errorCount = issue.consoleErrorCount || 0;
                    
                    html += `
                        <div style="background: #2A1A1A; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #EA4335;">
                            <h5 style="color: #EA4335; font-size: 14px; margin-bottom: 10px;">🚨 Console Errors Found (${errorCount})</h5>
                            <div style="max-height: 300px; overflow-y: auto;">`;
                    
                    for (const [idx, error] of consoleErrors.slice(0, 10).entries()) { // Show max 10 errors
                        const sourceLoc = error.sourceLocation || {};
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
        const highPriority = categoryRecommendations.filter(rec => rec.azionSolution.priority === 'high').length;
        const mediumPriority = categoryRecommendations.filter(rec => rec.azionSolution.priority === 'medium').length;
        const uniqueSolutions = new Set();
        categoryRecommendations.forEach(rec => {
            rec.azionSolution.solutions.forEach(sol => uniqueSolutions.add(sol.id));
        });
        
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
                            <div style="font-size: 24px; font-weight: bold; color: ${info.color};">${uniqueSolutions.size}</div>
                            <div style="color: #CCC; font-size: 12px;">Azion Solutions</div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    
    return html;
}

/**
 * Generate unified HTML report with Azion recommendations and CrUX integration
 * @param {string} url - Website URL
 * @param {Object} analysis - PageSpeed analysis
 * @param {Object} azionRecommendations - Azion recommendations
 * @param {string} timestamp - Report timestamp
 * @param {Object} cruxData - CrUX data (optional)
 * @returns {string} Complete HTML report
 */
function generateUnifiedHtmlReport(url, analysis, azionRecommendations, timestamp, cruxData = null) {
    // Calculate overall score
    const scores = Object.values(analysis).map(cat => cat.score || 0).filter(score => score > 0);
    const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    // Count issues by priority
    const highPriority = Object.values(analysis).reduce((count, cat) => {
        return count + (cat.issues || []).filter(issue => issue.impact === 'high').length;
    }, 0);
    
    // Generate CrUX chart if available
    let cruxChartHtml = "";
    let cruxAssessmentHtml = "";
    if (cruxData) {
        cruxChartHtml = createCoreVitalsChart(cruxData, url);
        const assessment = assessCruxPerformance(cruxData);
        if (assessment) {
            const scoreColor = assessment.overallScore >= 75 ? '#34A853' : 
                             assessment.overallScore >= 25 ? '#FBBC04' : '#EA4335';
            cruxAssessmentHtml = `
            <div class="section">
                <h2>📊 Real User Experience (CrUX Data)</h2>
                <div style="background: #0D0D0D; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 36px; font-weight: bold; color: ${scoreColor}; 
                                    background: #1A1A1A; padding: 15px; border-radius: 50%; min-width: 80px; text-align: center;">
                            ${Math.round(assessment.overallScore)}
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
    }
    
    let html = `
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
                    <div class="score-value ${overallScore >= 80 ? 'score-good' : overallScore >= 50 ? 'score-average' : 'score-poor'}">${Math.round(overallScore)}</div>
                    <div class="score-label">Overall Score</div>
                </div>`;
    
    // Add category scores
    for (const [category, data] of Object.entries(analysis)) {
        const score = data.score || 0;
        const scoreClass = score >= 80 ? 'score-good' : score >= 50 ? 'score-average' : 'score-poor';
        html += `
                <div class="score-card">
                    <div class="score-value ${scoreClass}">${Math.round(score)}</div>
                    <div class="score-label">${category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                </div>`;
    }
    
    const marketingData = azionRecommendations.marketingData?.summary || {};
    const finalHtml = html + `
            </div>
            
            ${cruxAssessmentHtml}
            
            <div class="marketing-summary">
                <h2 style="margin-bottom: 15px;">📊 Optimization Opportunity Summary</h2>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-number">${marketingData.totalIssues || 0}</div>
                        <div class="summary-label">Issues Found</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">${marketingData.highPriorityIssues || 0}</div>
                        <div class="summary-label">High Priority</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">${azionRecommendations.solutionCount || 0}</div>
                        <div class="summary-label">Azion Solutions</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">40%</div>
                        <div class="summary-label">Potential Speed Gain</div>
                    </div>
                </div>
            </div>
            
            ${generateCategorySections(analysis, azionRecommendations)}
            
            <div class="footer">
                <p>Powered by <span class="azion-logo">Azion Edge Platform</span></p>
                <p>Ready to optimize your website? Contact us for a personalized consultation.</p>
            </div>
        </div>
    </body>
    </html>`;
    
    return finalHtml;
}

/**
 * Main function with CLI argument support and interactive mode
 */
async function main() {
    const program = new Command();
    
    program
        .name('azion-analyzer')
        .description('Azion PageSpeed Analyzer - Marketing-focused performance analysis')
        .version('1.0.0')
        .option('--url <url>', 'Website URL to analyze')
        .option('--device <device>', 'Device type', 'desktop')
        .option('--crux', 'Include CrUX History data (comprehensive analysis)')
        .option('--weeks <weeks>', 'CrUX history weeks (1-40)', '25')
        .option('--interactive, -i', 'Interactive mode')
        .option('--open', 'Open report in browser')
        .option('--output-json <file>', 'Save marketing data as JSON file');
    
    program.parse();
    const options = program.opts();
    
    // Interactive mode or argument validation
    let config;
    if (options.interactive) {
        config = interactiveMode();
    } else if (!options.url) {
        console.log("❌ URL required. Use --interactive for guided setup or --url <website>");
        return;
    } else {
        config = {
            url: options.url.startsWith('http://') || options.url.startsWith('https://') ? 
                 options.url : `https://${options.url}`,
            device: options.device,
            useCrux: options.crux,
            weeks: parseInt(options.weeks),
            openBrowser: options.open
        };
    }
    
    // Get API key
    const apiKey = getApiKey();
    if (!apiKey) {
        return;
    }
    
    // Ensure reports directory
    await ensureReportsDirectory();
    
    const url = config.url;
    const device = config.device;
    
    console.log(`\n🔍 Analyzing ${url} (${device})...`);
    
    try {
        // Get PageSpeed Insights data
        console.log("📊 Fetching PageSpeed Insights data...");
        const pagespeedData = await getPagespeedInsights(apiKey, url, device);
        
        if (pagespeedData.error) {
            console.log(`❌ PageSpeed API error: ${pagespeedData.error.message || 'Unknown error'}`);
            return;
        }
        
        // Analyze data
        console.log("🔬 Analyzing performance data...");
        const analysis = analyzePagespeedData(pagespeedData);
        
        if (!analysis) {
            console.log("❌ Failed to analyze PageSpeed data");
            return;
        }
        
        // Get CrUX data if requested
        let cruxData = null;
        if (config.useCrux) {
            console.log("📊 Fetching CrUX History data...");
            const formFactor = device === 'mobile' ? 'PHONE' : 'DESKTOP';
            const weeks = config.weeks || 25;
            
            const cruxRawData = await getCruxHistory(apiKey, url, formFactor, weeks);
            const pagespeedCoreVitals = extractPagespeedCoreVitals(pagespeedData);
            cruxData = processCruxData(cruxRawData, pagespeedCoreVitals);
            
            if (cruxData && cruxData.hasCruxData) {
                console.log(`✅ CrUX data integrated with ${cruxData.dates?.length || 0} data points`);
            } else if (cruxData && cruxData.hasPagespeedData) {
                console.log("✅ Using PageSpeed Insights data for Core Web Vitals");
            }
        }
        
        // Generate Azion recommendations
        console.log("🎯 Generating Azion recommendations...");
        const azionRecommendations = generateAzionRecommendations(analysis);
        
        // Generate reports
        const timestamp = new Date().toLocaleString();
        const fileTimestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        
        // HTML Report
        console.log("📄 Generating HTML report...");
        const htmlReport = generateUnifiedHtmlReport(url, analysis, azionRecommendations, timestamp, cruxData);
        const htmlFilename = path.join(REPORTS_DIR, `azion_analysis_${device}_${fileTimestamp}.html`);
        
        await fs.writeFile(htmlFilename, htmlReport, 'utf-8');
        
        // JSON Marketing Data
        let jsonFilename = null;
        if (options.outputJson || config.saveJson) {
            jsonFilename = options.outputJson || path.join(REPORTS_DIR, `azion_marketing_data_${fileTimestamp}.json`);
            const marketingPitch = formatMarketingPitch(azionRecommendations.marketingData, url);
            
            const jsonData = {
                url,
                device,
                timestamp,
                analysis,
                azionRecommendations,
                marketingPitch
            };
            
            await fs.writeFile(jsonFilename, JSON.stringify(jsonData, null, 2), 'utf-8');
        }
        
        // Results summary
        console.log(`\n✅ Analysis complete!`);
        console.log(`📄 HTML Report: ${htmlFilename}`);
        if (jsonFilename) {
            console.log(`📊 Marketing Data: ${jsonFilename}`);
        }
        
        const marketingSummary = azionRecommendations.marketingData?.summary || {};
        console.log(`\n📈 Summary:`);
        console.log(`  • Issues found: ${marketingSummary.totalIssues || 0}`);
        console.log(`  • High priority: ${marketingSummary.highPriorityIssues || 0}`);
        console.log(`  • Azion solutions: ${azionRecommendations.solutionCount || 0}`);
        
        // Open browser
        if (config.openBrowser) {
            try {
                await open(`file://${path.resolve(htmlFilename)}`);
                console.log("🌐 Opening report in browser...");
            } catch (error) {
                console.log(`⚠️ Could not open browser: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ Error during analysis: ${error.message}`);
        console.error(error.stack);
    }
}

// Run main function if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    main().catch(console.error);
}
