import requests
import json
from datetime import datetime
import os
import sys
import argparse
from dotenv import load_dotenv
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import webbrowser

# Load environment variables from .env file
load_dotenv()

# Define reports directory
REPORTS_DIR = './reports'

def ensure_reports_directory():
    """Create reports directory if it doesn't exist"""
    if not os.path.exists(REPORTS_DIR):
        os.makedirs(REPORTS_DIR)
        print(f"📁 Created reports directory: {REPORTS_DIR}")

def get_pagespeed_insights(api_key, url, strategy='mobile'):
    """Fetch PageSpeed Insights data from Google API"""
    endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
    params = {
        'url': url,
        'key': api_key,
        'strategy': strategy,
        'category': ['performance', 'seo', 'accessibility', 'best-practices']
    }
    response = requests.get(endpoint, params=params)
    return response.json()

def get_crux_history(api_key, url, form_factor='PHONE', collection_period_count=25):
    """Fetch CrUX History data from Google API
    
    Args:
        api_key: Google API key with CrUX API enabled
        url: URL or origin to analyze
        form_factor: Device type - 'PHONE', 'DESKTOP', or 'TABLET'
        collection_period_count: Number of collection periods (1-40, default 25)
    
    Returns:
        dict: CrUX History API response
    """
    endpoint = f'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key={api_key}'
    
    # Core Web Vitals and other important metrics
    metrics = [
        'largest_contentful_paint',
        'first_contentful_paint',
        'cumulative_layout_shift',
        'interaction_to_next_paint',
        'experimental_time_to_first_byte'
    ]
    
    # Determine if it's an origin or specific URL
    is_origin = url.count('/') == 2 and not url.endswith('/')
    
    payload = {
        'formFactor': form_factor,
        'metrics': metrics,
        'collectionPeriodCount': collection_period_count
    }
    
    if is_origin:
        payload['origin'] = url
    else:
        payload['url'] = url
    
    response = requests.post(endpoint, json=payload)
    return response.json()

def generate_json_report(data, url):
    """Generate a JSON report from PageSpeed Insights data aiming at suggesting configuration changes in the application, website or the CDN platform behind it"""
    # Extract relevant metrics
    audits = data['lighthouseResult']['audits']
    categories = data['lighthouseResult']['categories']
    
    # Create JSON report
    report = {
        'url': url,
        'configurations': []
    }
    
    # Add configurations
    for category_id, category in categories.items():
        category_configurations = []
        for audit_id, audit in audits.items():
            if audit.get('score') is not None and audit['score'] < 1:
                if 'details' in audit and 'items' in audit['details']:
                    items = audit['details']['items']
                    # Ensure items is a list before processing
                    if items and isinstance(items, list):
                        for item in items[:5]:  # Limit to top 5 items
                            if isinstance(item, dict):
                                url_text = item.get('url', '')
                                node_text = item.get('node', {}).get('snippet', '') or item.get('node', {}).get('selector', '')
                                if url_text or node_text:
                                    configuration = {
                                        'category': category.get('title', ''),
                                        'audit': audit_id,
                                        'description': audit.get('description', ''),
                                        'potential_savings': audit.get('displayValue', 'N/A'),
                                        'url': url_text,
                                        'node': node_text
                                    }
                                    category_configurations.append(configuration)
        category_configurations.sort(key=lambda configuration: float(configuration['potential_savings'].replace('s', '').replace(',', '').strip('%')), reverse=True)
        report['configurations'].append({
            'category': category.get('title', ''),
            'configurations': category_configurations
        })
    
    return json.dumps(report, indent=4)

def process_crux_data(crux_data):
    """Process CrUX History data into a structured format for visualization
    
    Args:
        crux_data: Raw CrUX History API response
    
    Returns:
        dict: Processed data with dates and metrics
    """
    if 'error' in crux_data:
        return None
    
    record = crux_data.get('record', {})
    metrics = record.get('metrics', {})
    collection_periods = record.get('collectionPeriods', [])
    
    # Extract dates from collection periods
    dates = []
    for period in collection_periods:
        last_date = period.get('lastDate', {})
        date_str = f"{last_date.get('year')}-{last_date.get('month'):02d}-{last_date.get('day'):02d}"
        dates.append(date_str)
    
    processed = {
        'dates': dates,
        'metrics': {}
    }
    
    # Process each metric
    for metric_name, metric_data in metrics.items():
        percentiles = metric_data.get('percentilesTimeseries', {})
        histogram = metric_data.get('histogramTimeseries', [])
        
        processed['metrics'][metric_name] = {
            'p75': percentiles.get('p75s', []),
            'histogram': histogram
        }
    
    return processed

def assess_crux_performance(processed_data):
    """Assess the current performance state based on CrUX data
    
    Args:
        processed_data: Processed CrUX data
    
    Returns:
        dict: Assessment results with scores and recommendations
    """
    if not processed_data or not processed_data.get('metrics'):
        return None
    
    metrics = processed_data['metrics']
    
    # Core Web Vitals thresholds
    thresholds = {
        'largest_contentful_paint': {'good': 2500, 'poor': 4000},
        'first_contentful_paint': {'good': 1800, 'poor': 3000},
        'cumulative_layout_shift': {'good': 0.1, 'poor': 0.25},
        'interaction_to_next_paint': {'good': 200, 'poor': 500},
        'experimental_time_to_first_byte': {'good': 800, 'poor': 1800}
    }
    
    assessment = {
        'overall_score': 0,
        'metrics_assessment': {},
        'issues': [],
        'strengths': [],
        'priority_fixes': []
    }
    
    total_score = 0
    metric_count = 0
    
    for metric_name, metric_data in metrics.items():
        if metric_name not in thresholds:
            continue
            
        p75_values = metric_data.get('p75', [])
        if not p75_values:
            continue
            
        # Get latest value (most recent)
        try:
            latest_value = float(p75_values[-1])
            if metric_name == 'cumulative_layout_shift':
                latest_value *= 100  # CLS is stored as decimal
        except (ValueError, IndexError):
            continue
        
        threshold = thresholds[metric_name]
        
        # Determine performance level
        if latest_value <= threshold['good']:
            status = 'good'
            score = 100
        elif latest_value <= threshold['poor']:
            status = 'needs_improvement'
            # Linear interpolation between good and poor
            range_size = threshold['poor'] - threshold['good']
            position = (latest_value - threshold['good']) / range_size
            score = 75 - (position * 50)  # 75 to 25
        else:
            status = 'poor'
            score = 25 - min(25, (latest_value - threshold['poor']) / threshold['poor'] * 25)
        
        metric_info = {
            'name': metric_name,
            'display_name': {
                'largest_contentful_paint': 'Largest Contentful Paint (LCP)',
                'first_contentful_paint': 'First Contentful Paint (FCP)',
                'cumulative_layout_shift': 'Cumulative Layout Shift (CLS)',
                'interaction_to_next_paint': 'Interaction to Next Paint (INP)',
                'experimental_time_to_first_byte': 'Time to First Byte (TTFB)'
            }.get(metric_name, metric_name),
            'value': latest_value,
            'unit': 'ms' if metric_name != 'cumulative_layout_shift' else '',
            'status': status,
            'score': score,
            'threshold_good': threshold['good'],
            'threshold_poor': threshold['poor']
        }
        
        assessment['metrics_assessment'][metric_name] = metric_info
        total_score += score
        metric_count += 1
        
        # Add to issues or strengths
        if status == 'poor':
            assessment['issues'].append({
                'metric': metric_info['display_name'],
                'value': latest_value,
                'threshold': threshold['good'],
                'severity': 'high'
            })
            assessment['priority_fixes'].append(metric_name)
        elif status == 'needs_improvement':
            assessment['issues'].append({
                'metric': metric_info['display_name'],
                'value': latest_value,
                'threshold': threshold['good'],
                'severity': 'medium'
            })
        else:
            assessment['strengths'].append(metric_info['display_name'])
    
    # Calculate overall score
    if metric_count > 0:
        assessment['overall_score'] = total_score / metric_count
    
    return assessment

def get_pagespeed_recommendations(api_key, url, strategy='mobile'):
    """Get PageSpeed Insights recommendations for a URL
    
    Args:
        api_key: Google API key
        url: URL to analyze
        strategy: 'mobile' or 'desktop'
    
    Returns:
        dict: Recommendations and opportunities
    """
    try:
        data = get_pagespeed_insights(api_key, url, strategy)
        
        if 'error' in data:
            return None
        
        audits = data.get('lighthouseResult', {}).get('audits', {})
        
        recommendations = {
            'opportunities': [],
            'diagnostics': [],
            'passed_audits': []
        }
        
        # Key performance audits to focus on
        key_audits = {
            'largest-contentful-paint': 'Largest Contentful Paint',
            'first-contentful-paint': 'First Contentful Paint',
            'cumulative-layout-shift': 'Cumulative Layout Shift',
            'interaction-to-next-paint': 'Interaction to Next Paint',
            'server-response-time': 'Server Response Time',
            'render-blocking-resources': 'Eliminate render-blocking resources',
            'unused-css-rules': 'Remove unused CSS',
            'unused-javascript': 'Remove unused JavaScript',
            'modern-image-formats': 'Serve images in next-gen formats',
            'offscreen-images': 'Defer offscreen images',
            'unminified-css': 'Minify CSS',
            'unminified-javascript': 'Minify JavaScript',
            'efficient-animated-content': 'Use video formats for animated content',
            'total-byte-weight': 'Avoid enormous network payloads'
        }
        
        for audit_id, audit_name in key_audits.items():
            audit = audits.get(audit_id, {})
            
            if not audit:
                continue
                
            score = audit.get('score')
            if score is None:
                continue
                
            recommendation = {
                'id': audit_id,
                'title': audit.get('title', audit_name),
                'description': audit.get('description', ''),
                'score': score,
                'display_value': audit.get('displayValue', ''),
                'details': audit.get('details', {})
            }
            
            if score < 0.9:  # Failed or needs improvement
                if 'overallSavingsMs' in audit or 'overallSavingsBytes' in audit:
                    recommendations['opportunities'].append(recommendation)
                else:
                    recommendations['diagnostics'].append(recommendation)
            else:
                recommendations['passed_audits'].append(recommendation)
        
        return recommendations
        
    except Exception as e:
        print(f"Error getting PageSpeed recommendations: {str(e)}")
        return None

def create_metric_charts(processed_data, url, form_factor):
    """Create interactive Plotly charts for CrUX metrics
    
    Args:
        processed_data: Processed CrUX data
        url: The analyzed URL
        form_factor: Device type
    
    Returns:
        str: HTML string with embedded Plotly charts
    """
    if not processed_data or not processed_data.get('metrics'):
        return "<p>No data available for visualization</p>"
    
    dates = processed_data['dates']
    metrics = processed_data['metrics']
    
    # Metric configurations with thresholds
    metric_configs = {
        'largest_contentful_paint': {
            'name': 'LCP',
            'full_name': 'Largest Contentful Paint',
            'unit': 'ms',
            'good_threshold': 2500,
            'poor_threshold': 4000,
            'description': 'Measures loading performance',
            'color': '#4285F4',
            'order': 1
        },
        'first_contentful_paint': {
            'name': 'FCP',
            'full_name': 'First Contentful Paint',
            'unit': 'ms',
            'good_threshold': 1800,
            'poor_threshold': 3000,
            'description': 'Measures when first content appears',
            'color': '#34A853',
            'order': 2
        },
        'cumulative_layout_shift': {
            'name': 'CLS',
            'full_name': 'Cumulative Layout Shift',
            'unit': '',
            'good_threshold': 0.1,
            'poor_threshold': 0.25,
            'description': 'Measures visual stability',
            'multiplier': 100,  # CLS values are small decimals
            'color': '#FBBC04',
            'order': 3
        },
        'interaction_to_next_paint': {
            'name': 'INP',
            'full_name': 'Interaction to Next Paint',
            'unit': 'ms',
            'good_threshold': 200,
            'poor_threshold': 500,
            'description': 'Measures responsiveness',
            'color': '#EA4335',
            'order': 4
        },
        'experimental_time_to_first_byte': {
            'name': 'TTFB',
            'full_name': 'Time to First Byte',
            'unit': 'ms',
            'good_threshold': 800,
            'poor_threshold': 1800,
            'description': 'Measures server response time',
            'color': '#9334E6',
            'order': 5
        }
    }
    
    # Create combined timeline chart
    fig = go.Figure()
    
    # Normalize metrics to 0-100 scale for combined visualization
    normalized_data = {}
    
    for metric_key, metric_data in metrics.items():
        if metric_key not in metric_configs:
            continue
        
        config = metric_configs[metric_key]
        p75_values = metric_data.get('p75', [])
        
        if not p75_values:
            continue
        
        # Convert to float and apply multiplier for CLS
        multiplier = config.get('multiplier', 1)
        try:
            p75_values = [float(v) * multiplier for v in p75_values]
        except (ValueError, TypeError):
            continue
        
        # Normalize to 0-100 scale based on thresholds
        # Good threshold = 100, Poor threshold = 0
        good_threshold = config['good_threshold']
        poor_threshold = config['poor_threshold']
        
        if multiplier != 1:
            good_threshold *= multiplier
            poor_threshold *= multiplier
        
        normalized_values = []
        for val in p75_values:
            if val <= good_threshold:
                # Above good threshold: scale from 100 to 75
                normalized = 100 - ((val / good_threshold) * 25)
            elif val <= poor_threshold:
                # Between good and poor: scale from 75 to 25
                range_size = poor_threshold - good_threshold
                position = (val - good_threshold) / range_size
                normalized = 75 - (position * 50)
            else:
                # Below poor threshold: scale from 25 to 0
                excess = val - poor_threshold
                normalized = max(0, 25 - (excess / poor_threshold * 25))
            
            normalized_values.append(normalized)
        
        # Add trace to the combined chart
        fig.add_trace(
            go.Scatter(
                x=dates,
                y=normalized_values,
                mode='lines+markers',
                name=config['name'],
                line=dict(color=config['color'], width=3),
                marker=dict(size=8),
                hovertemplate=(
                    f"<b>{config['full_name']}</b><br>"
                    f"Date: %{{x}}<br>"
                    f"Quality Score: %{{y:.1f}}/100<br>"
                    f"<extra></extra>"
                )
            )
        )
    
    # Add quality threshold lines
    fig.add_hline(
        y=75,
        line_dash="dash",
        line_color="green",
        annotation_text="Good Threshold",
        annotation_position="right"
    )
    
    fig.add_hline(
        y=25,
        line_dash="dash",
        line_color="red",
        annotation_text="Poor Threshold",
        annotation_position="right"
    )
    
    # Update layout with black & orange theme
    fig.update_layout(
        height=550,
        title=dict(
            text=f"Core Web Vitals - Quality Timeline<br><sub style='font-size:14px;color:#CCC'>{url}</sub>",
            x=0.5,
            font=dict(size=20, color='#F3652B')
        ),
        xaxis_title="Date",
        yaxis_title="Quality Score (0-100)",
        hovermode='x unified',
        plot_bgcolor='#1A1A1A',
        paper_bgcolor='#0D0D0D',
        font=dict(color='#FFFFFF'),
        legend=dict(
            orientation="h",
            yanchor="top",
            y=-0.15,
            xanchor="center",
            x=0.5,
            bgcolor='rgba(0,0,0,0.5)',
            bordercolor='#F3652B',
            borderwidth=1
        ),
        yaxis=dict(
            range=[0, 105],
            gridcolor='#333333'
        ),
        xaxis=dict(
            gridcolor='#333333'
        ),
        margin=dict(t=120, b=100, l=50, r=50)
    )
    
    # Convert to HTML
    combined_chart_html = fig.to_html(include_plotlyjs='cdn', div_id='chart_combined')
    
    return combined_chart_html

def generate_assessment_html(assessment):
    """Generate HTML for performance assessment section"""
    if not assessment:
        return ""
    
    overall_score = assessment['overall_score']
    
    # Determine score class
    if overall_score >= 75:
        score_class = 'score-good'
    elif overall_score >= 25:
        score_class = 'score-needs-improvement'
    else:
        score_class = 'score-poor'
    
    # Generate metrics cards
    metrics_html = ""
    for metric_name, metric_info in assessment['metrics_assessment'].items():
        status_class = metric_info['status'].replace('_', '-')
        value_display = f"{metric_info['value']:.0f}{metric_info['unit']}" if metric_info['unit'] else f"{metric_info['value']:.2f}"
        
        metrics_html += f"""
            <div class="metric-card {status_class}">
                <div class="metric-name">{metric_info['display_name']}</div>
                <div class="metric-value">{value_display}</div>
                <div class="metric-status {status_class}">{metric_info['status'].replace('_', ' ')}</div>
            </div>
        """
    
    # Generate issues list
    issues_html = ""
    if assessment['issues']:
        for issue in assessment['issues']:
            severity_class = issue['severity']
            value_display = f"{issue['value']:.0f}ms" if 'ms' in str(issue['threshold']) else f"{issue['value']:.2f}"
            threshold_display = f"{issue['threshold']:.0f}ms" if 'ms' in str(issue['threshold']) else f"{issue['threshold']:.2f}"
            
            issues_html += f"""
                <li class="issue-item {severity_class}">
                    <strong>{issue['metric']}</strong>: {value_display} (target: ≤{threshold_display})
                </li>
            """
    
    # Generate strengths badges
    strengths_html = ""
    if assessment['strengths']:
        for strength in assessment['strengths']:
            strengths_html += f'<span class="strength-badge">{strength}</span>'
    
    return f"""
    <div class="assessment-section">
        <div class="assessment-header">
            <div class="overall-score {score_class}">{overall_score:.0f}</div>
            <div>
                <div class="assessment-title">🎯 Performance Assessment</div>
                <div class="assessment-subtitle">Based on latest CrUX data from real users</div>
            </div>
        </div>
        
        <div class="metrics-grid">
            {metrics_html}
        </div>
        
        {f'''
        <div style="margin-bottom: 15px;">
            <h3 style="color: #EA4335; margin-bottom: 10px;">⚠️ Issues Found</h3>
            <ul class="issues-list">
                {issues_html}
            </ul>
        </div>
        ''' if issues_html else ''}
        
        {f'''
        <div>
            <h3 style="color: #34A853; margin-bottom: 10px;">✅ Strengths</h3>
            <div class="strengths-list">
                {strengths_html}
            </div>
        </div>
        ''' if strengths_html else ''}
    </div>
    """

def generate_recommendations_html(recommendations):
    """Generate HTML for PageSpeed Insights recommendations section"""
    if not recommendations:
        return ""
    
    opportunities_html = ""
    if recommendations['opportunities']:
        for rec in recommendations['opportunities'][:5]:  # Limit to top 5
            savings = rec.get('display_value', '')
            opportunities_html += f"""
                <div class="recommendation-item">
                    <div class="recommendation-title">{rec['title']}</div>
                    <div class="recommendation-description">{rec['description']}</div>
                    {f'<div class="recommendation-savings">💡 Potential savings: {savings}</div>' if savings else ''}
                </div>
            """
    
    diagnostics_html = ""
    if recommendations['diagnostics']:
        for rec in recommendations['diagnostics'][:3]:  # Limit to top 3
            diagnostics_html += f"""
                <div class="recommendation-item">
                    <div class="recommendation-title">{rec['title']}</div>
                    <div class="recommendation-description">{rec['description']}</div>
                </div>
            """
    
    if not opportunities_html and not diagnostics_html:
        return ""
    
    return f"""
    <div class="recommendations-section">
        <div class="recommendations-title">🚀 PageSpeed Insights Recommendations</div>
        
        {f'''
        <div style="margin-bottom: 20px;">
            <h3 style="color: #F3652B; margin-bottom: 15px; font-size: 16px;">Opportunities</h3>
            {opportunities_html}
        </div>
        ''' if opportunities_html else ''}
        
        {f'''
        <div>
            <h3 style="color: #F3652B; margin-bottom: 15px; font-size: 16px;">Diagnostics</h3>
            {diagnostics_html}
        </div>
        ''' if diagnostics_html else ''}
    </div>
    """

def generate_crux_html_report(crux_data, url, form_factor, include_recommendations=False):
    """Generate an HTML report with CrUX History visualizations
    
    Args:
        crux_data: Raw CrUX History API response
        url: The analyzed URL
        form_factor: Device type
        include_recommendations: Whether to include PageSpeed Insights recommendations
    
    Returns:
        str: Complete HTML report
    """
    processed_data = process_crux_data(crux_data)
    
    if not processed_data:
        error_msg = crux_data.get('error', {}).get('message', 'Unknown error')
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>CrUX History Report - Error</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .error {{ color: red; padding: 20px; background: #ffebee; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <h1>CrUX History Report - Error</h1>
            <div class="error">
                <h2>Error fetching data</h2>
                <p>{error_msg}</p>
                <p>This could mean:</p>
                <ul>
                    <li>The URL doesn't have enough traffic in the CrUX dataset</li>
                    <li>The URL format is incorrect</li>
                    <li>The API key doesn't have CrUX API enabled</li>
                </ul>
            </div>
        </body>
        </html>
        """
    
    charts_html = create_metric_charts(processed_data, url, form_factor)
    
    # Get performance assessment
    assessment = assess_crux_performance(processed_data)
    
    # Get PageSpeed Insights recommendations if requested
    recommendations = None
    if include_recommendations:
        api_key = os.getenv('PAGESPEED_INSIGHTS_API_KEY')
        if api_key:
            print("🔍 Fetching PageSpeed Insights recommendations...")
            strategy = 'mobile' if form_factor == 'PHONE' else 'desktop'
            recommendations = get_pagespeed_recommendations(api_key, url, strategy)
    
    # Get summary statistics
    record = crux_data.get('record', {})
    key = record.get('key', {})
    collection_periods = record.get('collectionPeriods', [])
    
    first_period = collection_periods[0] if collection_periods else {}
    last_period = collection_periods[-1] if collection_periods else {}
    
    first_date = first_period.get('firstDate', {})
    last_date = last_period.get('lastDate', {})
    
    date_range = f"{first_date.get('year', 'N/A')}-{first_date.get('month', 'N/A'):02d}-{first_date.get('day', 'N/A'):02d} to {last_date.get('year', 'N/A')}-{last_date.get('month', 'N/A'):02d}-{last_date.get('day', 'N/A'):02d}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>CrUX Report - {url}</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #0D0D0D;
                color: #FFFFFF;
                padding: 20px;
            }}
            .container {{
                max-width: 1400px;
                margin: 0 auto;
            }}
            header {{
                background: linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%);
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #F3652B;
                margin-bottom: 20px;
            }}
            h1 {{
                color: #F3652B;
                font-size: 24px;
                margin-bottom: 15px;
            }}
            .info-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                font-size: 13px;
            }}
            .info-item {{
                display: flex;
                gap: 8px;
            }}
            .info-label {{
                color: #999;
            }}
            .info-value {{
                color: #FFF;
                font-weight: 500;
            }}
            .legend {{
                background: #1A1A1A;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid #333;
            }}
            .legend-title {{
                color: #F3652B;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 10px;
            }}
            .legend-content {{
                font-size: 12px;
                line-height: 1.6;
                color: #CCC;
            }}
            .legend-content strong {{
                color: #FFF;
            }}
            .good {{ color: #34A853; }}
            .needs-improvement {{ color: #FBBC04; }}
            .poor {{ color: #EA4335; }}
            .chart-container {{
                background: #0D0D0D;
                border-radius: 8px;
                padding: 10px;
                border: 1px solid #333;
            }}
            footer {{
                margin-top: 20px;
                padding: 15px;
                text-align: center;
                font-size: 11px;
                color: #666;
                border-top: 1px solid #333;
            }}
            footer a {{
                color: #F3652B;
                text-decoration: none;
            }}
            footer a:hover {{
                text-decoration: underline;
            }}
            .assessment-section {{
                background: #1A1A1A;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid #333;
            }}
            .assessment-header {{
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }}
            .overall-score {{
                font-size: 48px;
                font-weight: bold;
                padding: 15px 20px;
                border-radius: 50%;
                min-width: 80px;
                text-align: center;
            }}
            .score-good {{ background: #34A853; color: white; }}
            .score-needs-improvement {{ background: #FBBC04; color: black; }}
            .score-poor {{ background: #EA4335; color: white; }}
            .assessment-title {{
                color: #F3652B;
                font-size: 18px;
                font-weight: 600;
            }}
            .assessment-subtitle {{
                color: #CCC;
                font-size: 14px;
            }}
            .metrics-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }}
            .metric-card {{
                background: #0D0D0D;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid;
            }}
            .metric-card.good {{ border-left-color: #34A853; }}
            .metric-card.needs-improvement {{ border-left-color: #FBBC04; }}
            .metric-card.poor {{ border-left-color: #EA4335; }}
            .metric-name {{
                font-weight: 600;
                margin-bottom: 5px;
            }}
            .metric-value {{
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }}
            .metric-status {{
                font-size: 12px;
                text-transform: uppercase;
                font-weight: 500;
            }}
            .recommendations-section {{
                background: #1A1A1A;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid #333;
            }}
            .recommendations-title {{
                color: #F3652B;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
            }}
            .recommendation-item {{
                background: #0D0D0D;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 10px;
                border-left: 4px solid #F3652B;
            }}
            .recommendation-title {{
                font-weight: 600;
                margin-bottom: 8px;
                color: #FFF;
            }}
            .recommendation-description {{
                color: #CCC;
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 8px;
            }}
            .recommendation-savings {{
                color: #34A853;
                font-size: 12px;
                font-weight: 500;
            }}
            .issues-list {{
                list-style: none;
                padding: 0;
            }}
            .issue-item {{
                background: #0D0D0D;
                padding: 12px 15px;
                border-radius: 6px;
                margin-bottom: 8px;
                border-left: 4px solid;
            }}
            .issue-item.high {{ border-left-color: #EA4335; }}
            .issue-item.medium {{ border-left-color: #FBBC04; }}
            .strengths-list {{
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }}
            .strength-badge {{
                background: #34A853;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>Chrome UX Report - Quality Timeline</h1>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">URL:</span>
                        <span class="info-value">{url}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Device:</span>
                        <span class="info-value">{form_factor}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Period:</span>
                        <span class="info-value">{date_range}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Weeks:</span>
                        <span class="info-value">{len(collection_periods)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Generated:</span>
                        <span class="info-value">{datetime.now().strftime('%Y-%m-%d %H:%M')}</span>
                    </div>
                </div>
            </header>
            
            <div class="legend">
                <div class="legend-title">📊 Quality Score Guide</div>
                <div class="legend-content">
                    <strong>Score:</strong> <span class="good">75-100 Good</span> | <span class="needs-improvement">25-75 Needs Improvement</span> | <span class="poor">0-25 Poor</span><br>
                    <strong>Metrics:</strong> LCP (Loading), FCP (First Paint), CLS (Stability), INP (Responsiveness), TTFB (Server)<br>
                    <strong>Source:</strong> P75 values from real Chrome users
                </div>
            </div>
            
            {generate_assessment_html(assessment) if assessment else ''}
            
            <div class="chart-container">
                {charts_html}
            </div>
            
            {generate_recommendations_html(recommendations) if recommendations else ''}
            
            <footer>
                Data: Chrome UX Report (CrUX) | <a href="https://web.dev/vitals/" target="_blank">Learn more about Core Web Vitals</a>
            </footer>
        </div>
    </body>
    </html>
    """
    
    return html

def generate_html_report(data, title):
    """Generate HTML report from PageSpeed Insights data
    
    Args:
        data: PageSpeed Insights API response
        title: Report title
    
    Returns:
        str: HTML report content
    """
    try:
        lighthouse_result = data.get('lighthouseResult', {})
        categories = lighthouse_result.get('categories', {})
        audits = lighthouse_result.get('audits', {})
        
        # Extract scores
        performance_score = categories.get('performance', {}).get('score', 0) * 100
        seo_score = categories.get('seo', {}).get('score', 0) * 100
        accessibility_score = categories.get('accessibility', {}).get('score', 0) * 100
        best_practices_score = categories.get('best-practices', {}).get('score', 0) * 100
        
        # Extract key metrics
        metrics = {}
        metric_keys = {
            'first-contentful-paint': 'First Contentful Paint',
            'speed-index': 'Speed Index',
            'largest-contentful-paint': 'Largest Contentful Paint',
            'interactive': 'Time to Interactive',
            'total-blocking-time': 'Total Blocking Time',
            'cumulative-layout-shift': 'Cumulative Layout Shift'
        }
        
        for key, name in metric_keys.items():
            audit = audits.get(key, {})
            metrics[name] = {
                'value': audit.get('displayValue', 'N/A'),
                'score': audit.get('score', 0)
            }
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title} - PageSpeed Report</title>
            <style>
                * {{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }}
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #0D0D0D;
                    color: #FFFFFF;
                    padding: 20px;
                }}
                .container {{
                    max-width: 1200px;
                    margin: 0 auto;
                }}
                header {{
                    background: linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%);
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #F3652B;
                    margin-bottom: 20px;
                }}
                h1 {{
                    color: #F3652B;
                    font-size: 24px;
                    margin-bottom: 10px;
                }}
                .scores-grid {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 30px;
                }}
                .score-card {{
                    background: #1A1A1A;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid #333;
                }}
                .score-value {{
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }}
                .score-good {{ color: #34A853; }}
                .score-average {{ color: #FBBC04; }}
                .score-poor {{ color: #EA4335; }}
                .score-label {{
                    color: #CCC;
                    font-size: 14px;
                }}
                .metrics-section {{
                    background: #1A1A1A;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #333;
                }}
                .metrics-title {{
                    color: #F3652B;
                    font-size: 18px;
                    margin-bottom: 15px;
                }}
                .metrics-grid {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                }}
                .metric-item {{
                    background: #0D0D0D;
                    padding: 15px;
                    border-radius: 6px;
                    border-left: 4px solid;
                }}
                .metric-item.good {{ border-left-color: #34A853; }}
                .metric-item.average {{ border-left-color: #FBBC04; }}
                .metric-item.poor {{ border-left-color: #EA4335; }}
                .metric-name {{
                    font-weight: 600;
                    margin-bottom: 5px;
                }}
                .metric-value {{
                    font-size: 20px;
                    font-weight: bold;
                }}
                footer {{
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>{title}</h1>
                    <p>Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </header>
                
                <div class="scores-grid">
                    <div class="score-card">
                        <div class="score-value {'score-good' if performance_score >= 90 else 'score-average' if performance_score >= 50 else 'score-poor'}">{performance_score:.0f}</div>
                        <div class="score-label">Performance</div>
                    </div>
                    <div class="score-card">
                        <div class="score-value {'score-good' if accessibility_score >= 90 else 'score-average' if accessibility_score >= 50 else 'score-poor'}">{accessibility_score:.0f}</div>
                        <div class="score-label">Accessibility</div>
                    </div>
                    <div class="score-card">
                        <div class="score-value {'score-good' if best_practices_score >= 90 else 'score-average' if best_practices_score >= 50 else 'score-poor'}">{best_practices_score:.0f}</div>
                        <div class="score-label">Best Practices</div>
                    </div>
                    <div class="score-card">
                        <div class="score-value {'score-good' if seo_score >= 90 else 'score-average' if seo_score >= 50 else 'score-poor'}">{seo_score:.0f}</div>
                        <div class="score-label">SEO</div>
                    </div>
                </div>
                
                <div class="metrics-section">
                    <div class="metrics-title">Core Web Vitals & Performance Metrics</div>
                    <div class="metrics-grid">
        """
        
        for name, metric in metrics.items():
            score = metric['score']
            score_class = 'good' if score >= 0.9 else 'average' if score >= 0.5 else 'poor'
            html += f"""
                        <div class="metric-item {score_class}">
                            <div class="metric-name">{name}</div>
                            <div class="metric-value">{metric['value']}</div>
                        </div>
            """
        
        html += """
                    </div>
                </div>
                
                <footer>
                    <p>Report generated using Google PageSpeed Insights API</p>
                </footer>
            </div>
        </body>
        </html>
        """
        
        return html
        
    except Exception as e:
        return f"""
        <!DOCTYPE html>
        <html>
        <head><title>Error</title></head>
        <body>
            <h1>Error generating report</h1>
            <p>An error occurred: {str(e)}</p>
        </body>
        </html>
        """

def process_json_file(json_path):
    """Process an existing JSON report file and generate HTML reports"""
    try:
        # Read the JSON file
        with open(json_path, 'r') as f:
            json_report = json.load(f)
        
        # Extract data
        url = json_report.get('url', 'Unknown URL')
        mobile_data = json_report.get('mobile')
        desktop_data = json_report.get('desktop')
        
        if not mobile_data or not desktop_data:
            print("❌ Error: JSON file doesn't contain valid mobile and desktop data")
            return
        
        # Ensure reports directory exists
        ensure_reports_directory()
        
        # Generate timestamp for new files
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Generate and save HTML reports
        print(f"\n📊 Processing data for: {url}")
        print("📱 Generating mobile HTML report...")
        html_mobile = generate_html_report(mobile_data, f"{url} (Mobile)")
        
        print("💻 Generating desktop HTML report...")
        html_desktop = generate_html_report(desktop_data, f"{url} (Desktop)")
        
        mobile_filename = os.path.join(REPORTS_DIR, f'pagespeed_report_mobile_{timestamp}.html')
        desktop_filename = os.path.join(REPORTS_DIR, f'pagespeed_report_desktop_{timestamp}.html')
        
        with open(mobile_filename, 'w') as f:
            f.write(html_mobile)
        
        with open(desktop_filename, 'w') as f:
            f.write(html_desktop)
        
        print(f"\n✅ HTML reports generated successfully!")
        print(f"\n📄 Files created:")
        print(f"  • Mobile HTML Report: {mobile_filename}")
        print(f"  • Desktop HTML Report: {desktop_filename}")
        print(f"\n💡 Tip: Open the HTML files in your browser to view the reports")
        
    except FileNotFoundError:
        print(f"❌ Error: File '{json_path}' not found")
    except json.JSONDecodeError:
        print(f"❌ Error: Invalid JSON format in '{json_path}'")
    except KeyError as e:
        print(f"❌ Error: Missing required field in JSON: {str(e)}")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

def handle_crux_history(url, form_factor='PHONE', collection_period_count=25, open_browser=False, include_recommendations=False):
    """Handle CrUX History data retrieval and visualization
    
    Args:
        url: URL or origin to analyze
        form_factor: Device type - 'PHONE', 'DESKTOP', or 'TABLET'
        collection_period_count: Number of weeks (1-40)
        open_browser: Whether to open the report in browser
        include_recommendations: Whether to include PageSpeed Insights recommendations
    """
    # Get API key from environment variable
    api_key = os.getenv('PAGESPEED_INSIGHTS_API_KEY')
    if not api_key:
        print("❌ Error: Please set the PAGESPEED_INSIGHTS_API_KEY environment variable")
        print("\nTo set it, run:")
        print("  export PAGESPEED_INSIGHTS_API_KEY='your-api-key-here'")
        print("\nNote: The same API key works for both PageSpeed Insights and CrUX APIs")
        print("Make sure the Chrome UX Report API is enabled in your Google Cloud Console")
        return
    
    if not url:
        print("❌ Error: URL cannot be empty")
        return
    
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    # Validate form factor
    form_factor = form_factor.upper()
    if form_factor not in ['PHONE', 'DESKTOP', 'TABLET']:
        print(f"⚠️  Invalid form factor '{form_factor}'. Using PHONE.")
        form_factor = 'PHONE'
    
    # Validate collection period count
    if collection_period_count < 1 or collection_period_count > 40:
        print("⚠️  Invalid range. Using default of 25 weeks.")
        collection_period_count = 25
    
    print(f"\n🔍 Fetching CrUX History data for {url}...")
    print(f"   Device: {form_factor}")
    print(f"   Periods: {collection_period_count} weeks")
    print("\n⏳ This may take a moment...")
    
    try:
        # Fetch CrUX History data
        crux_data = get_crux_history(api_key, url, form_factor, collection_period_count)
        
        if 'error' in crux_data:
            error_msg = crux_data['error'].get('message', 'Unknown error')
            print(f"\n❌ Error: {error_msg}")
            print("\nPossible reasons:")
            print("  • The URL doesn't have enough traffic in the CrUX dataset")
            print("  • The Chrome UX Report API is not enabled in your Google Cloud Console")
            print("  • The URL format is incorrect")
            print("\nTip: Try using just the origin (e.g., https://example.com) instead of a specific page")
            return
        
        # Ensure reports directory exists
        ensure_reports_directory()
        
        # Generate timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save raw JSON data
        json_filename = os.path.join(REPORTS_DIR, f'crux_history_{timestamp}.json')
        with open(json_filename, 'w') as f:
            json.dump(crux_data, f, indent=2)
        
        # Generate HTML report
        print("📊 Generating visualizations...")
        html_report = generate_crux_html_report(crux_data, url, form_factor, include_recommendations)
        
        # Save HTML report
        html_filename = os.path.join(REPORTS_DIR, f'crux_history_{form_factor.lower()}_{timestamp}.html')
        with open(html_filename, 'w') as f:
            f.write(html_report)
        
        print(f"\n✅ CrUX History report generated successfully!")
        print(f"\n📄 Files created:")
        print(f"  • JSON Data: {json_filename}")
        print(f"  • HTML Report: {html_filename}")
        
        # Display summary
        record = crux_data.get('record', {})
        metrics = record.get('metrics', {})
        collection_periods = record.get('collectionPeriods', [])
        
        print(f"\n📈 Summary:")
        print(f"  • Metrics collected: {len(metrics)}")
        print(f"  • Time periods: {len(collection_periods)} weeks")
        
        if collection_periods:
            first_period = collection_periods[0]
            last_period = collection_periods[-1]
            first_date = first_period.get('firstDate', {})
            last_date = last_period.get('lastDate', {})
            print(f"  • Date range: {first_date.get('year')}-{first_date.get('month'):02d}-{first_date.get('day'):02d} to {last_date.get('year')}-{last_date.get('month'):02d}-{last_date.get('day'):02d}")
        
        # Open browser if requested
        if open_browser:
            try:
                # Get absolute path
                abs_path = os.path.abspath(html_filename)
                webbrowser.open(f'file://{abs_path}')
                print(f"✅ Opening report in your default browser...")
            except Exception as e:
                print(f"⚠️  Could not open browser automatically: {str(e)}")
                print(f"💡 You can manually open: {html_filename}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error occurred: {str(e)}")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")
        import traceback
        traceback.print_exc()

def main():
    """Main function to run the PageSpeed Insights report generator"""
    parser = argparse.ArgumentParser(
        description='PageSpeed Insights and CrUX History Report Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Analyze a URL with PageSpeed Insights
  python pagespeed_report.py --url https://example.com
  
  # Get CrUX History data
  python pagespeed_report.py --crux --url https://example.com --device desktop --weeks 30
  
  # Get CrUX data with PageSpeed Insights recommendations
  python pagespeed_report.py --crux --url https://example.com --recommendations
  
  # Process existing JSON file
  python pagespeed_report.py --json report.json
  
  # Open report in browser automatically
  python pagespeed_report.py --crux --url https://example.com --open
        """
    )
    
    # Main operation mode
    parser.add_argument('--url', type=str, help='URL to analyze')
    parser.add_argument('--json', type=str, metavar='FILE', help='Process existing JSON report file')
    parser.add_argument('--crux', action='store_true', help='Use CrUX History API instead of PageSpeed Insights')
    
    # CrUX-specific options
    parser.add_argument('--device', type=str, choices=['phone', 'desktop', 'tablet'], 
                        default='phone', help='Device type for CrUX (default: phone)')
    parser.add_argument('--weeks', type=int, default=25, metavar='N',
                        help='Number of weeks for CrUX history (1-40, default: 25)')
    
    # General options
    parser.add_argument('--open', action='store_true', help='Open report in browser after generation')
    parser.add_argument('--recommendations', action='store_true', 
                        help='Include PageSpeed Insights recommendations (only for CrUX mode)')
    
    args = parser.parse_args()
    
    # Process JSON file if provided
    if args.json:
        print(f"\n📂 Processing existing JSON file: {args.json}")
        process_json_file(args.json)
        return
    
    # Require URL for other operations
    if not args.url:
        parser.print_help()
        print("\n❌ Error: --url is required (unless using --json)")
        return
    
    url = args.url
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    # Handle CrUX History mode
    if args.crux:
        form_factor = args.device.upper()
        handle_crux_history(url, form_factor, args.weeks, args.open, args.recommendations)
        return
    
    # PageSpeed Insights mode
    api_key = os.getenv('PAGESPEED_INSIGHTS_API_KEY')
    if not api_key:
        print("❌ Error: Please set the PAGESPEED_INSIGHTS_API_KEY environment variable")
        print("\nTo set it, run:")
        print("  export PAGESPEED_INSIGHTS_API_KEY='your-api-key-here'")
        print("\nTo get an API key:")
        print("  1. Go to https://console.cloud.google.com/")
        print("  2. Enable the PageSpeed Insights API")
        print("  3. Create credentials (API key)")
        return
    
    print(f"\n🔍 Analyzing {url} (this may take a moment)...")
    
    try:
        # Get data for both mobile and desktop
        print("📱 Testing mobile performance...")
        mobile_data = get_pagespeed_insights(api_key, url, 'mobile')
        
        if 'error' in mobile_data:
            print(f"❌ Error: {mobile_data['error'].get('message', 'Unknown error')}")
            return
        
        print("💻 Testing desktop performance...")
        desktop_data = get_pagespeed_insights(api_key, url, 'desktop')
        
        # Ensure reports directory exists
        ensure_reports_directory()
        
        # Generate reports
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Generate JSON report
        json_report = {
            'url': url,
            'generated_at': datetime.now().isoformat(),
            'mobile': mobile_data,
            'desktop': desktop_data
        }
        
        # Save JSON report
        json_filename = os.path.join(REPORTS_DIR, f'pagespeed_report_{timestamp}.json')
        with open(json_filename, 'w') as f:
            json.dump(json_report, f, indent=2)
        
        # Generate and save HTML reports
        html_mobile = generate_html_report(mobile_data, f"{url} (Mobile)")
        html_desktop = generate_html_report(desktop_data, f"{url} (Desktop)")
        
        mobile_filename = os.path.join(REPORTS_DIR, f'pagespeed_report_mobile_{timestamp}.html')
        desktop_filename = os.path.join(REPORTS_DIR, f'pagespeed_report_desktop_{timestamp}.html')
        
        with open(mobile_filename, 'w') as f:
            f.write(html_mobile)
        
        with open(desktop_filename, 'w') as f:
            f.write(html_desktop)
        
        print(f"\n✅ Reports generated successfully!")
        print(f"\n📄 Files created:")
        print(f"  • JSON Report: {json_filename}")
        print(f"  • Mobile HTML Report: {mobile_filename}")
        print(f"  • Desktop HTML Report: {desktop_filename}")
        
        # Open browser if requested
        if args.open:
            try:
                abs_path = os.path.abspath(mobile_filename)
                webbrowser.open(f'file://{abs_path}')
                print(f"\n✅ Opening mobile report in your default browser...")
            except Exception as e:
                print(f"\n⚠️  Could not open browser automatically: {str(e)}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error occurred: {str(e)}")
    except KeyError as e:
        print(f"❌ Error parsing API response: {str(e)}")
        print("The API response format may have changed or the URL may be invalid")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
