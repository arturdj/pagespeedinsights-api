#!/usr/bin/env python3
"""
Azion PageSpeed Analyzer - Simplified Marketing-Focused Tool

Main Goals:
- Interactive CLI and argument-based usage
- Map PageSpeed issues to Azion Platform solutions
- Generate unified HTML reports with Azion recommendations
- Output JSON for marketing campaigns
- Robust error handling with best-effort approach
"""

import requests
import json
import os
import argparse
from datetime import datetime
from dotenv import load_dotenv
import webbrowser
from azion_solutions import (
    get_azion_solutions_for_audit,
    generate_marketing_campaign_data,
    format_marketing_pitch
)
from crux_integration import (
    get_crux_history,
    extract_pagespeed_core_vitals,
    process_crux_data,

    create_core_vitals_chart,
    assess_crux_performance
)

# Load environment variables
load_dotenv()

# Configuration
REPORTS_DIR = './reports'
API_TIMEOUT = 120

def ensure_reports_directory():
    """Create reports directory if it doesn't exist"""
    if not os.path.exists(REPORTS_DIR):
        os.makedirs(REPORTS_DIR)

def get_api_key():
    """Get API key with user-friendly error handling"""
    api_key = os.getenv('PAGESPEED_INSIGHTS_API_KEY')
    if not api_key:
        print("❌ Error: PageSpeed Insights API key not found")
        print("\nSetup instructions:")
        print("1. Get API key from: https://console.cloud.google.com/")
        print("2. Enable PageSpeed Insights API and CrUX API")
        print("3. Set: export PAGESPEED_INSIGHTS_API_KEY='your-key'")
        return None
    return api_key

def interactive_mode():
    """Interactive CLI for user-friendly operation"""
    print("\n🚀 Azion PageSpeed Analyzer")
    print("=" * 40)
    
    # Get URL
    while True:
        url = input("\n🌐 Enter website URL: ").strip()
        if url:
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            break
        print("❌ URL required")
    
    # Analysis type
    print("\n📊 Analysis type:")
    print("1. PageSpeed only (fast)")
    print("2. CrUX + PageSpeed (comprehensive)")
    
    while True:
        choice = input("Choice (1/2): ").strip()
        if choice in ['1', '2']:
            break
        print("❌ Enter 1 or 2")
    
    use_crux = choice == '2'
    
    # Device type
    device = 'mobile'
    if use_crux:
        print("\n📱 Device:")
        print("1. Mobile  2. Desktop  3. Tablet")
        device_choice = input("Choice (1/2/3): ").strip()
        device_map = {'1': 'mobile', '2': 'desktop', '3': 'tablet'}
        device = device_map.get(device_choice, 'mobile')
    
    open_browser = input("\n🌐 Open report? (y/N): ").lower() == 'y'
    
    weeks = 25
    if use_crux:
        weeks_input = input(f"\n📅 CrUX history weeks (1-40, default {weeks}): ").strip()
        if weeks_input.isdigit():
            weeks = max(1, min(int(weeks_input), 40))
    
    return {
        'url': url,
        'use_crux': use_crux,
        'device': device,
        'weeks': weeks,
        'open_browser': open_browser
    }

def get_pagespeed_insights(api_key, url, strategy='mobile'):
    """Fetch PageSpeed Insights data"""
    endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
    params = {
        'url': url,
        'key': api_key,
        'strategy': strategy,
        'category': ['performance', 'seo', 'accessibility', 'best-practices']
    }
    
    try:
        response = requests.get(endpoint, params=params, timeout=API_TIMEOUT)
        return response.json()
    except Exception as e:
        return {'error': {'message': f'API error: {str(e)}'}}

def analyze_pagespeed_data(pagespeed_data):
    """Analyze PageSpeed data and extract actionable insights"""
    if 'error' in pagespeed_data:
        return None
    
    try:
        lighthouse_result = pagespeed_data.get('lighthouseResult', {})
        audits = lighthouse_result.get('audits', {})
        categories = lighthouse_result.get('categories', {})
        
        analysis = {
            'performance': {'score': categories.get('performance', {}).get('score', 0) * 100, 'issues': []},
            'accessibility': {'score': categories.get('accessibility', {}).get('score', 0) * 100, 'issues': []},
            'best_practices': {'score': categories.get('best-practices', {}).get('score', 0) * 100, 'issues': []},
            'seo': {'score': categories.get('seo', {}).get('score', 0) * 100, 'issues': []}
        }
        
        # Process audits and map to categories
        for audit_id, audit in audits.items():
            score = audit.get('score')
            if score is None or score >= 0.9:
                continue
                
            audit_info = {
                'id': audit_id,
                'title': audit.get('title', ''),
                'description': audit.get('description', ''),
                'score': score,
                'display_value': audit.get('displayValue', ''),
                'impact': 'high' if score < 0.5 else 'medium',
                'original_pagespeed_data': {
                    'description': audit.get('description', ''),
                    'explanation': audit.get('explanation', ''),
                    'score_display_mode': audit.get('scoreDisplayMode', ''),
                    'numeric_value': audit.get('numericValue'),
                    'numeric_unit': audit.get('numericUnit', ''),
                    'details': audit.get('details', {}),
                    'warnings': audit.get('warnings', [])
                }
            }
            
            # Extract console error details for errors-in-console audit
            if audit_id == 'errors-in-console':
                console_errors = []
                details = audit.get('details', {})
                items = details.get('items', [])
                
                for item in items:
                    error_info = {
                        'description': item.get('description', ''),
                        'source': item.get('source', ''),
                        'source_location': item.get('sourceLocation', {})
                    }
                    console_errors.append(error_info)
                
                audit_info['console_errors'] = console_errors
                audit_info['console_error_count'] = len(console_errors)
            
            # Comprehensive audit categorization
            performance_audits = [
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
            ]
            
            accessibility_audits = [
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
            ]
            
            best_practices_audits = [
                'is-on-https', 'no-vulnerable-libraries', 'external-anchors-use-rel-noopener',
                'geolocation-on-start', 'notification-on-start', 'password-inputs-can-be-pasted-into',
                'uses-http2', 'uses-passive-event-listeners', 'no-document-write', 'has-doctype',
                'charset', 'dom-size', 'external-anchors-use-rel-noopener', 'js-libraries',
                'deprecations', 'third-party-cookies', 'inspector-issues', 'csp-xss',
                'unused-javascript', 'modern-image-formats', 'appcache-manifest', 'doctype',
                'no-vulnerable-libraries', 'image-aspect-ratio', 'image-size-responsive',
                'preload-fonts', 'font-display', 'errors-in-console'
            ]
            
            seo_audits = [
                'viewport', 'document-title', 'meta-description', 'crawlable-anchors', 'is-crawlable',
                'robots-txt', 'hreflang', 'canonical', 'structured-data', 'html-has-lang',
                'html-lang-valid', 'http-status-code', 'link-text', 'plugins', 'tap-targets',
                'font-size', 'legible-font-sizes', 'image-alt', 'video-caption'
            ]
            
            # Categorize audit
            if audit_id in performance_audits:
                analysis['performance']['issues'].append(audit_info)
            elif audit_id in accessibility_audits:
                analysis['accessibility']['issues'].append(audit_info)
            elif audit_id in best_practices_audits:
                analysis['best_practices']['issues'].append(audit_info)
            elif audit_id in seo_audits:
                analysis['seo']['issues'].append(audit_info)
            else:
                # Default to performance if not categorized
                analysis['performance']['issues'].append(audit_info)
        
        return analysis
        
    except Exception as e:
        print(f"⚠️ Error analyzing PageSpeed data: {str(e)}")
        return None

def generate_azion_recommendations(analysis):
    """Generate Azion Platform recommendations based on analysis"""
    if not analysis:
        return {'recommendations': [], 'marketing_data': {}}
    
    recommendations = []
    all_solutions = set()
    
    for category_name, category_data in analysis.items():
        for issue in category_data.get('issues', []):
            azion_solution = get_azion_solutions_for_audit(issue['id'], issue)
            if azion_solution:
                recommendations.append({
                    'category': category_name,
                    'issue': issue,
                    'azion_solution': azion_solution
                })
                for solution in azion_solution['solutions']:
                    all_solutions.add(solution['id'])
    
    # Generate marketing campaign data
    marketing_data = generate_marketing_campaign_data(analysis)
    
    return {
        'recommendations': recommendations,
        'marketing_data': marketing_data,
        'solution_count': len(all_solutions)
    }

def generate_category_sections(analysis, azion_recommendations):
    """Generate comprehensive category-based sections for the HTML report"""
    
    # Category metadata for comprehensive analysis
    category_info = {
        'performance': {
            'title': '⚡ Performance Optimization',
            'icon': '🚀',
            'color': '#F3652B',
            'description': 'Core Web Vitals and loading performance optimizations',
            'azion_focus': 'Edge Cache, Image Processor, Edge Functions, and Tiered Cache for maximum performance gains'
        },
        'accessibility': {
            'title': '♿ Accessibility Enhancement', 
            'icon': '🌐',
            'color': '#34A853',
            'description': 'WCAG compliance and inclusive user experience improvements',
            'azion_focus': 'Edge Functions and AI Inference for dynamic accessibility enhancements'
        },
        'best_practices': {
            'title': '🛡️ Security & Best Practices',
            'icon': '🔒', 
            'color': '#4285F4',
            'description': 'Security, privacy, and modern web standards compliance',
            'azion_focus': 'Edge Firewall, Edge Functions, and security headers for comprehensive protection'
        },
        'seo': {
            'title': '🔍 SEO Optimization',
            'icon': '📈',
            'color': '#FBBC04',
            'description': 'Search engine visibility and discoverability improvements',
            'azion_focus': 'Edge Functions, Edge DNS, and dynamic content optimization for better rankings'
        }
    }
    
    html = ""
    
    # Group recommendations by category
    recommendations_by_category = {}
    for rec in azion_recommendations.get('recommendations', []):
        category = rec.get('category', 'performance')
        if category not in recommendations_by_category:
            recommendations_by_category[category] = []
        recommendations_by_category[category].append(rec)
    
    # Generate section for each category
    for category_key, category_data in analysis.items():
        if category_key not in category_info:
            continue
            
        info = category_info[category_key]
        issues = category_data.get('issues', [])
        score = category_data.get('score', 0)
        
        if not issues:
            continue
            
        # Category header
        html += f"""
            <div class="section category-section" style="border-left-color: {info['color']};">
                <div class="category-header">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                        <div style="font-size: 48px;">{info['icon']}</div>
                        <div>
                            <h2 style="color: {info['color']}; margin-bottom: 5px;">{info['title']}</h2>
                            <p style="color: #CCC; margin-bottom: 10px;">{info['description']}</p>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="background: {info['color']}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
                                    Score: {score:.0f}/100
                                </div>
                                <div style="color: #CCC;">
                                    {len(issues)} issue{'s' if len(issues) != 1 else ''} found
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="azion-focus" style="background: #2A2A2A; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid {info['color']};">
                    <h3 style="color: {info['color']}; margin-bottom: 10px;">🎯 Azion Platform Focus</h3>
                    <p style="color: #CCC; line-height: 1.6;">{info['azion_focus']}</p>
                </div>"""
        
        # Add recommendations for this category
        category_recommendations = recommendations_by_category.get(category_key, [])
        
        if category_recommendations:
            html += f"""
                <div class="recommendations-list">
                    <h3 style="color: {info['color']}; margin-bottom: 20px;">🔧 Optimization Recommendations</h3>"""
            
            for rec in category_recommendations[:8]:  # Top 8 per category
                issue = rec['issue']
                solution = rec['azion_solution']
                priority_class = f"priority-{solution['priority']}"
                
                # Get original PageSpeed data for context
                original_data = issue.get('original_pagespeed_data', {})
                original_description = original_data.get('description', '')
                display_value = issue.get('display_value', '')
                
                html += f"""
                    <div class="azion-recommendation {priority_class}" style="margin-bottom: 20px;">
                        <div class="recommendation-header">
                            <h4 style="color: white; margin-bottom: 5px;">{issue['title']}</h4>
                            <span style="background: {info['color']}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                {solution['priority'].upper()} PRIORITY
                            </span>
                        </div>
                        <p style="color: #CCC; margin: 10px 0; line-height: 1.5;">{solution['description']}</p>"""
                
                # Add original PageSpeed Insights context
                if original_description or display_value:
                    html += f"""
                        <div style="background: #1A1A1A; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #4285F4;">
                            <h5 style="color: #4285F4; font-size: 14px; margin-bottom: 8px;">📊 PageSpeed Insights Details</h5>"""
                    
                    if display_value:
                        html += f"""<p style="color: #FFF; font-weight: 600; margin-bottom: 5px; font-size: 14px;">Current Value: {display_value}</p>"""
                    
                    if original_description:
                        html += f"""<p style="color: #CCC; font-size: 13px; line-height: 1.5;">{original_description}</p>"""
                    
                    html += """</div>"""
                
                # Add console errors section for errors-in-console audit
                if issue['id'] == 'errors-in-console' and issue.get('console_errors'):
                    console_errors = issue.get('console_errors', [])
                    error_count = issue.get('console_error_count', 0)
                    
                    html += f"""
                        <div style="background: #2A1A1A; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #EA4335;">
                            <h5 style="color: #EA4335; font-size: 14px; margin-bottom: 10px;">🚨 Console Errors Found ({error_count})</h5>
                            <div style="max-height: 300px; overflow-y: auto;">"""
                    
                    for idx, error in enumerate(console_errors[:10]):  # Show max 10 errors
                        source_loc = error.get('source_location', {})
                        url = source_loc.get('url', 'Unknown source')
                        line = source_loc.get('line', 0)
                        column = source_loc.get('column', 0)
                        source_type = error.get('source', 'console.error')
                        
                        # Truncate long URLs for display
                        display_url = url if len(url) <= 60 else f"...{url[-57:]}"
                        
                        html += f"""
                                <div style="background: #1A0A0A; padding: 12px; border-radius: 4px; margin-bottom: 8px; border-left: 2px solid #EA4335;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                        <span style="color: #EA4335; font-size: 12px; font-weight: 600;">{source_type.upper()}</span>
                                        <span style="color: #888; font-size: 11px;">Line {line}:{column}</span>
                                    </div>
                                    <p style="color: #FFF; font-size: 13px; margin-bottom: 5px; font-family: 'Courier New', monospace;">{error.get('description', 'No description')}</p>
                                    <p style="color: #888; font-size: 11px; word-break: break-all;" title="{url}">{display_url}</p>
                                </div>"""
                    
                    if error_count > 10:
                        html += f"""
                                <div style="text-align: center; padding: 10px; color: #888; font-size: 12px;">
                                    ... and {error_count - 10} more errors
                                </div>"""
                    
                    html += """
                            </div>
                        </div>"""
                
                # Add Azion solutions
                html += """<div class="solution-list" style="margin-top: 15px;">"""
                
                for sol in solution['solutions'][:3]:  # Top 3 solutions per recommendation
                    html += f"""
                            <div class="solution-item" style="background: #0D0D0D; border-left-color: {info['color']};">
                                <div class="solution-name" style="color: {info['color']};">{sol['name']}</div>
                                <div class="solution-desc">{sol['description']}</div>
                            </div>"""
                
                html += """</div></div>"""
            
            html += """</div>"""
        
        # Add category summary
        high_priority = sum(1 for rec in category_recommendations if rec['azion_solution']['priority'] == 'high')
        medium_priority = sum(1 for rec in category_recommendations if rec['azion_solution']['priority'] == 'medium')
        
        html += f"""
                <div class="category-summary" style="background: #1A1A1A; padding: 20px; border-radius: 8px; margin-top: 25px;">
                    <h3 style="color: {info['color']}; margin-bottom: 15px;">📊 Category Summary</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #EA4335;">{high_priority}</div>
                            <div style="color: #CCC; font-size: 12px;">High Priority</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #FBBC04;">{medium_priority}</div>
                            <div style="color: #CCC; font-size: 12px;">Medium Priority</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: {info['color']};">{len(set(sol['id'] for rec in category_recommendations for sol in rec['azion_solution']['solutions']))}</div>
                            <div style="color: #CCC; font-size: 12px;">Azion Solutions</div>
                        </div>
                    </div>
                </div>
            </div>"""
    
    return html

def generate_unified_html_report(url, analysis, azion_recommendations, timestamp, crux_data=None):
    """Generate unified HTML report with Azion recommendations and CrUX integration"""
    
    # Calculate overall score
    scores = [cat.get('score', 0) for cat in analysis.values() if 'score' in cat]
    overall_score = sum(scores) / len(scores) if scores else 0
    
    # Count issues by priority
    high_priority = sum(1 for cat in analysis.values() 
                       for issue in cat.get('issues', []) 
                       if issue.get('impact') == 'high')
    
    # Generate CrUX chart if available
    crux_chart_html = ""
    crux_assessment_html = ""
    if crux_data:
        crux_chart_html = create_core_vitals_chart(crux_data, url)
        assessment = assess_crux_performance(crux_data)
        if assessment:
            crux_assessment_html = f"""
            <div class="section">
                <h2>📊 Real User Experience (CrUX Data)</h2>
                <div style="background: #0D0D0D; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 36px; font-weight: bold; color: {'#34A853' if assessment['overall_score'] >= 75 else '#FBBC04' if assessment['overall_score'] >= 25 else '#EA4335'}; 
                                    background: #1A1A1A; padding: 15px; border-radius: 50%; min-width: 80px; text-align: center;">
                            {assessment['overall_score']:.0f}
                        </div>
                        <div>
                            <h3 style="color: #F3652B; margin-bottom: 5px;">Core Web Vitals Score</h3>
                            <p style="color: #CCC;">Based on real Chrome user data</p>
                        </div>
                    </div>
                </div>
                {crux_chart_html}
            </div>"""
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Azion Performance Analysis - {url}</title>
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #0D0D0D; color: #FFFFFF; padding: 20px; line-height: 1.6;
            }}
            .container {{ max-width: 1200px; margin: 0 auto; }}
            .header {{ 
                background: linear-gradient(135deg, #F3652B 0%, #FF8C42 100%);
                padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;
            }}
            .header h1 {{ font-size: 32px; margin-bottom: 10px; color: white; }}
            .header p {{ font-size: 18px; opacity: 0.9; }}
            .score-grid {{ 
                display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px; margin-bottom: 30px;
            }}
            .score-card {{ 
                background: #1A1A1A; padding: 25px; border-radius: 12px; text-align: center;
                border: 2px solid #333; transition: transform 0.2s;
            }}
            .score-card:hover {{ transform: translateY(-2px); }}
            .score-value {{ font-size: 36px; font-weight: bold; margin-bottom: 8px; }}
            .score-good {{ color: #34A853; }}
            .score-average {{ color: #FBBC04; }}
            .score-poor {{ color: #EA4335; }}
            .score-label {{ color: #CCC; font-size: 14px; text-transform: uppercase; }}
            .section {{ 
                background: #1A1A1A; padding: 30px; border-radius: 12px; 
                margin-bottom: 30px; border-left: 4px solid #F3652B;
            }}
            .section h2 {{ color: #F3652B; font-size: 24px; margin-bottom: 20px; }}
            .category-section {{ 
                background: #1A1A1A; padding: 35px; border-radius: 15px; 
                margin-bottom: 40px; border-left: 6px solid #F3652B;
            }}
            .category-header {{ margin-bottom: 25px; }}
            .azion-focus {{ 
                background: #2A2A2A; padding: 20px; border-radius: 8px; 
                margin-bottom: 25px; border-left: 4px solid #F3652B;
            }}
            .recommendations-list {{ margin-bottom: 25px; }}
            .category-summary {{ 
                background: #0D0D0D; padding: 25px; border-radius: 12px; 
                border: 2px solid #333; margin-top: 25px;
            }}
            .azion-recommendation {{ 
                background: #0D0D0D; padding: 20px; border-radius: 8px; 
                margin-bottom: 15px; border-left: 4px solid #34A853;
            }}
            .recommendation-header {{ display: flex; justify-content: space-between; align-items: center; }}
            .priority-high {{ border-left-color: #EA4335; }}
            .priority-medium {{ border-left-color: #FBBC04; }}
            .priority-low {{ border-left-color: #34A853; }}
            .solution-list {{ margin-top: 15px; }}
            .solution-item {{ 
                background: #2A2A2A; padding: 15px; border-radius: 6px; 
                margin-bottom: 10px; border-left: 3px solid #F3652B;
            }}
            .solution-name {{ font-weight: 600; color: #F3652B; margin-bottom: 5px; }}
            .solution-desc {{ color: #CCC; font-size: 14px; }}
            .marketing-summary {{ 
                background: linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%);
                padding: 25px; border-radius: 12px; border: 2px solid #F3652B;
            }}
            .summary-grid {{ 
                display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px; margin-top: 15px;
            }}
            .summary-item {{ text-align: center; }}
            .summary-number {{ font-size: 28px; font-weight: bold; color: #F3652B; }}
            .summary-label {{ color: #CCC; font-size: 12px; }}
            .footer {{ 
                text-align: center; padding: 20px; color: #666; 
                border-top: 1px solid #333; margin-top: 30px;
            }}
            .azion-logo {{ color: #F3652B; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Azion Performance Analysis</h1>
                <p>Comprehensive website optimization recommendations for {url}</p>
                <p style="font-size: 14px; margin-top: 10px;">Generated on {timestamp}</p>
            </div>
            
            <div class="score-grid">
                <div class="score-card">
                    <div class="score-value {'score-good' if overall_score >= 80 else 'score-average' if overall_score >= 50 else 'score-poor'}">{overall_score:.0f}</div>
                    <div class="score-label">Overall Score</div>
                </div>"""
    
    # Add category scores
    for category, data in analysis.items():
        score = data.get('score', 0)
        score_class = 'score-good' if score >= 80 else 'score-average' if score >= 50 else 'score-poor'
        html += f"""
                <div class="score-card">
                    <div class="score-value {score_class}">{score:.0f}</div>
                    <div class="score-label">{category.replace('_', ' ').title()}</div>
                </div>"""
    
    html += f"""
            </div>
            
            {crux_assessment_html}
            
            <div class="marketing-summary">
                <h2 style="margin-bottom: 15px;">📊 Optimization Opportunity Summary</h2>
                <div class="summary-grid">"""
    
    marketing_data = azion_recommendations.get('marketing_data', {}).get('summary', {})
    html += f"""
                    <div class="summary-item">
                        <div class="summary-number">{marketing_data.get('total_issues', 0)}</div>
                        <div class="summary-label">Issues Found</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">{marketing_data.get('high_priority_issues', 0)}</div>
                        <div class="summary-label">High Priority</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">{azion_recommendations.get('solution_count', 0)}</div>
                        <div class="summary-label">Azion Solutions</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">40%</div>
                        <div class="summary-label">Potential Speed Gain</div>
                    </div>
                </div>
            </div>"""
    
    # Generate comprehensive category-based recommendations
    html += generate_category_sections(analysis, azion_recommendations)
    
    html += f"""
            <div class="footer">
                <p>Powered by <span class="azion-logo">Azion Edge Platform</span></p>
                <p>Ready to optimize your website? Contact us for a personalized consultation.</p>
            </div>
        </div>
    </body>
    </html>"""
    
    return html

def main():
    """Main function with CLI argument support and interactive mode"""
    parser = argparse.ArgumentParser(
        description='Azion PageSpeed Analyzer - Marketing-focused performance analysis',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument('--url', help='Website URL to analyze')
    parser.add_argument('--device', choices=['mobile', 'desktop'], default='mobile', help='Device type')
    parser.add_argument('--crux', action='store_true', help='Include CrUX History data (comprehensive analysis)')
    parser.add_argument('--weeks', type=int, default=25, help='CrUX history weeks (1-40, default: 25)')
    parser.add_argument('--interactive', '-i', action='store_true', help='Interactive mode')
    parser.add_argument('--open', action='store_true', help='Open report in browser')
    parser.add_argument('--output-json', help='Save marketing data as JSON file')
    
    args = parser.parse_args()
    
    # Interactive mode or argument validation
    if args.interactive or not args.url:
        if not args.interactive and not args.url:
            print("❌ URL required. Use --interactive for guided setup or --url <website>")
            return
        config = interactive_mode()
    else:
        config = {
            'url': args.url if args.url.startswith(('http://', 'https://')) else f'https://{args.url}',
            'device': args.device,
            'use_crux': args.crux,
            'weeks': args.weeks,
            'open_browser': args.open
        }
    
    # Get API key
    api_key = get_api_key()
    if not api_key:
        return
    
    # Ensure reports directory
    ensure_reports_directory()
    
    url = config['url']
    device = config['device']
    
    print(f"\n🔍 Analyzing {url} ({device})...")
    
    try:
        # Get PageSpeed Insights data
        print("📊 Fetching PageSpeed Insights data...")
        pagespeed_data = get_pagespeed_insights(api_key, url, device)
        
        if 'error' in pagespeed_data:
            print(f"❌ PageSpeed API error: {pagespeed_data['error'].get('message', 'Unknown error')}")
            return
        
        # Analyze data
        print("🔬 Analyzing performance data...")
        analysis = analyze_pagespeed_data(pagespeed_data)
        
        if not analysis:
            print("❌ Failed to analyze PageSpeed data")
            return
        
        # Get CrUX data if requested
        crux_data = None
        if config.get('use_crux'):
            print("📊 Fetching CrUX History data...")
            form_factor = 'PHONE' if device == 'mobile' else 'DESKTOP'
            weeks = config.get('weeks', 25)
            
            crux_raw_data = get_crux_history(api_key, url, form_factor, weeks)
            pagespeed_core_vitals = extract_pagespeed_core_vitals(pagespeed_data)
            crux_data = process_crux_data(crux_raw_data, pagespeed_core_vitals)
            
            if crux_data and crux_data.get('has_crux_data'):
                print(f"✅ CrUX data integrated with {len(crux_data.get('dates', []))} data points")
            elif crux_data and crux_data.get('has_pagespeed_data'):
                print("✅ Using PageSpeed Insights data for Core Web Vitals")
        
        # Generate Azion recommendations
        print("🎯 Generating Azion recommendations...")
        azion_recommendations = generate_azion_recommendations(analysis)
        
        # Generate reports
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        file_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # HTML Report
        print("📄 Generating HTML report...")
        html_report = generate_unified_html_report(url, analysis, azion_recommendations, timestamp, crux_data)
        html_filename = os.path.join(REPORTS_DIR, f'azion_analysis_{device}_{file_timestamp}.html')
        
        with open(html_filename, 'w', encoding='utf-8') as f:
            f.write(html_report)
        
        # JSON Marketing Data
        json_filename = None
        if args.output_json or config.get('save_json'):
            json_filename = args.output_json or os.path.join(REPORTS_DIR, f'azion_marketing_data_{file_timestamp}.json')
            marketing_pitch = format_marketing_pitch(azion_recommendations['marketing_data'], url)
            
            json_data = {
                'url': url,
                'device': device,
                'timestamp': timestamp,
                'analysis': analysis,
                'azion_recommendations': azion_recommendations,
                'marketing_pitch': marketing_pitch
            }
            
            with open(json_filename, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        # Results summary
        print(f"\n✅ Analysis complete!")
        print(f"📄 HTML Report: {html_filename}")
        if json_filename:
            print(f"📊 Marketing Data: {json_filename}")
        
        marketing_summary = azion_recommendations.get('marketing_data', {}).get('summary', {})
        print(f"\n📈 Summary:")
        print(f"  • Issues found: {marketing_summary.get('total_issues', 0)}")
        print(f"  • High priority: {marketing_summary.get('high_priority_issues', 0)}")
        print(f"  • Azion solutions: {azion_recommendations.get('solution_count', 0)}")
        
        # Open browser
        if config.get('open_browser'):
            try:
                webbrowser.open(f'file://{os.path.abspath(html_filename)}')
                print("🌐 Opening report in browser...")
            except Exception as e:
                print(f"⚠️ Could not open browser: {str(e)}")
        
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
