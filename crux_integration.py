"""
CrUX Integration Module for Azion PageSpeed Analyzer
Handles Chrome User Experience Report data integration
"""

import requests
from datetime import datetime
import plotly.graph_objects as go

def get_crux_history(api_key, url, form_factor='PHONE', collection_period_count=25):
    """Fetch CrUX History data with error handling"""
    endpoint = f'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key={api_key}'
    
    metrics = [
        'largest_contentful_paint',
        'first_contentful_paint', 
        'cumulative_layout_shift',
        'interaction_to_next_paint',
        'experimental_time_to_first_byte'
    ]
    
    # Determine if URL is origin or specific page
    is_origin = url.count('/') == 2 and not url.endswith('/')
    
    payload = {
        'formFactor': form_factor,
        'metrics': metrics,
        'collectionPeriodCount': min(max(collection_period_count, 1), 40)
    }
    
    if is_origin:
        payload['origin'] = url
    else:
        payload['url'] = url
    
    try:
        response = requests.post(endpoint, json=payload, timeout=30)
        data = response.json()
        
        if 'error' in data:
            print(f"⚠️ CrUX data unavailable: {data['error'].get('message', 'Unknown error')}")
            return create_empty_crux_data(url, form_factor)
        
        return data
        
    except Exception as e:
        print(f"⚠️ CrUX API error: {str(e)}")
        return create_empty_crux_data(url, form_factor)

def create_empty_crux_data(url, form_factor):
    """Create empty CrUX data structure for fallback"""
    return {
        'record': {
            'key': {'url': url, 'formFactor': form_factor},
            'metrics': {},
            'collectionPeriods': []
        },
        'error': {'message': 'CrUX data not available'}
    }

def extract_pagespeed_core_vitals(pagespeed_data):
    """Extract Core Web Vitals from PageSpeed Insights data"""
    if not pagespeed_data or 'error' in pagespeed_data:
        return None
    
    try:
        audits = pagespeed_data.get('lighthouseResult', {}).get('audits', {})
        core_vitals = {}
        
        # Extract Core Web Vitals
        audit_mapping = {
            'largest-contentful-paint': 'largest_contentful_paint',
            'first-contentful-paint': 'first_contentful_paint',
            'cumulative-layout-shift': 'cumulative_layout_shift',
            'interaction-to-next-paint': 'interaction_to_next_paint',
            'server-response-time': 'experimental_time_to_first_byte'
        }
        
        for audit_id, metric_name in audit_mapping.items():
            audit = audits.get(audit_id, {})
            if audit.get('numericValue') is not None:
                core_vitals[metric_name] = audit['numericValue']
        
        return core_vitals if core_vitals else None
        
    except Exception as e:
        print(f"⚠️ Error extracting Core Web Vitals: {str(e)}")
        return None

def process_crux_data(crux_data, pagespeed_core_vitals=None):
    """Process CrUX data with PageSpeed integration"""
    if 'error' in crux_data and not pagespeed_core_vitals:
        return None
    
    record = crux_data.get('record', {})
    metrics = record.get('metrics', {})
    collection_periods = record.get('collectionPeriods', [])
    
    # Extract dates
    dates = []
    for period in collection_periods:
        last_date = period.get('lastDate', {})
        try:
            date_str = f"{last_date.get('year')}-{last_date.get('month', 1):02d}-{last_date.get('day', 1):02d}"
            dates.append(date_str)
        except (ValueError, TypeError):
            dates.append('N/A')
    
    # Add current date for PageSpeed data
    if pagespeed_core_vitals:
        current_date = datetime.now().strftime('%Y-%m-%d')
        dates.append(current_date)
    
    processed = {
        'dates': dates,
        'metrics': {},
        'has_pagespeed_data': bool(pagespeed_core_vitals),
        'has_crux_data': bool(metrics)
    }
    
    # Process CrUX metrics
    for metric_name, metric_data in metrics.items():
        percentiles = metric_data.get('percentilesTimeseries', {})
        p75_values = percentiles.get('p75s', [])
        
        # Add PageSpeed data if available
        if pagespeed_core_vitals and metric_name in pagespeed_core_vitals:
            pagespeed_value = pagespeed_core_vitals[metric_name]
            # Adjust CLS format
            if metric_name == 'cumulative_layout_shift':
                pagespeed_value = pagespeed_value / 100
            p75_values = p75_values + [pagespeed_value]
        
        processed['metrics'][metric_name] = {
            'p75': p75_values,
            'histogram': metric_data.get('histogramTimeseries', [])
        }
    
    # Add PageSpeed-only metrics
    if pagespeed_core_vitals:
        for metric_name, value in pagespeed_core_vitals.items():
            if metric_name not in processed['metrics']:
                if metric_name == 'cumulative_layout_shift':
                    value = value / 100
                processed['metrics'][metric_name] = {
                    'p75': [value],
                    'histogram': []
                }
    
    return processed

def create_core_vitals_chart(processed_data, url):
    """Create Core Web Vitals timeline chart"""
    if not processed_data or not processed_data.get('metrics'):
        return "<p>No Core Web Vitals data available</p>"
    
    dates = processed_data['dates']
    metrics = processed_data['metrics']
    has_pagespeed_data = processed_data.get('has_pagespeed_data', False)
    
    # Metric configurations
    metric_configs = {
        'largest_contentful_paint': {
            'name': 'LCP', 'color': '#4285F4', 'good': 2500, 'poor': 4000, 'unit': 'ms'
        },
        'first_contentful_paint': {
            'name': 'FCP', 'color': '#34A853', 'good': 1800, 'poor': 3000, 'unit': 'ms'
        },
        'cumulative_layout_shift': {
            'name': 'CLS', 'color': '#FBBC04', 'good': 0.1, 'poor': 0.25, 'unit': '', 'multiplier': 100
        },
        'interaction_to_next_paint': {
            'name': 'INP', 'color': '#EA4335', 'good': 200, 'poor': 500, 'unit': 'ms'
        },
        'experimental_time_to_first_byte': {
            'name': 'TTFB', 'color': '#9334E6', 'good': 800, 'poor': 1800, 'unit': 'ms'
        }
    }
    
    fig = go.Figure()
    
    for metric_key, metric_data in metrics.items():
        if metric_key not in metric_configs:
            continue
        
        config = metric_configs[metric_key]
        p75_values = metric_data.get('p75', [])
        
        if not p75_values:
            continue
        
        # Apply multiplier for CLS
        multiplier = config.get('multiplier', 1)
        display_values = [float(v) * multiplier for v in p75_values]
        
        # Create marker styles
        marker_sizes = [8] * len(display_values)
        marker_colors = [config['color']] * len(display_values)
        
        if has_pagespeed_data and len(display_values) > 0:
            marker_sizes[-1] = 15
            marker_colors[-1] = '#F3652B'
        
        fig.add_trace(
            go.Scatter(
                x=dates,
                y=display_values,
                mode='lines+markers',
                name=config['name'],
                line=dict(color=config['color'], width=3),
                marker=dict(size=marker_sizes, color=marker_colors),
                hovertemplate=f"<b>{config['name']}</b><br>Date: %{{x}}<br>Value: %{{y}}{config['unit']}<extra></extra>"
            )
        )
    
    # Add threshold lines
    fig.add_hline(y=2500, line_dash="dash", line_color="green", annotation_text="LCP Good")
    fig.add_hline(y=4000, line_dash="dash", line_color="red", annotation_text="LCP Poor")
    
    title_text = f"Core Web Vitals Timeline - {url}"
    if has_pagespeed_data:
        title_text += "<br><sub>🔴 Latest point shows real-time PageSpeed data</sub>"
    
    fig.update_layout(
        height=500,
        title=dict(text=title_text, x=0.5, font=dict(size=18, color='#F3652B')),
        xaxis_title="Date",
        yaxis_title="Performance Metrics",
        plot_bgcolor='#1A1A1A',
        paper_bgcolor='#0D0D0D',
        font=dict(color='#FFFFFF'),
        legend=dict(orientation="h", yanchor="top", y=-0.15, xanchor="center", x=0.5),
        margin=dict(t=100, b=80, l=50, r=50)
    )
    
    return fig.to_html(include_plotlyjs='cdn', div_id='core_vitals_chart')

def assess_crux_performance(processed_data):
    """Assess performance based on CrUX data"""
    if not processed_data or not processed_data.get('metrics'):
        return None
    
    metrics = processed_data['metrics']
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
        'strengths': []
    }
    
    total_score = 0
    metric_count = 0
    
    for metric_name, metric_data in metrics.items():
        if metric_name not in thresholds:
            continue
        
        p75_values = metric_data.get('p75', [])
        if not p75_values:
            continue
        
        try:
            latest_value = float(p75_values[-1])
            if metric_name == 'cumulative_layout_shift':
                latest_value *= 100
        except (ValueError, IndexError, TypeError):
            continue
        
        threshold = thresholds[metric_name]
        
        # Determine performance level
        if latest_value <= threshold['good']:
            status = 'good'
            score = 100
        elif latest_value <= threshold['poor']:
            status = 'needs_improvement'
            range_size = threshold['poor'] - threshold['good']
            position = (latest_value - threshold['good']) / range_size
            score = 75 - (position * 50)
        else:
            status = 'poor'
            score = max(0, 25 - (latest_value - threshold['poor']) / threshold['poor'] * 25)
        
        display_names = {
            'largest_contentful_paint': 'Largest Contentful Paint (LCP)',
            'first_contentful_paint': 'First Contentful Paint (FCP)',
            'cumulative_layout_shift': 'Cumulative Layout Shift (CLS)',
            'interaction_to_next_paint': 'Interaction to Next Paint (INP)',
            'experimental_time_to_first_byte': 'Time to First Byte (TTFB)'
        }
        
        metric_info = {
            'name': metric_name,
            'display_name': display_names.get(metric_name, metric_name),
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
        
        if status == 'poor':
            assessment['issues'].append({
                'metric': metric_info['display_name'],
                'value': latest_value,
                'threshold': threshold['good'],
                'severity': 'high'
            })
        elif status == 'needs_improvement':
            assessment['issues'].append({
                'metric': metric_info['display_name'],
                'value': latest_value,
                'threshold': threshold['good'],
                'severity': 'medium'
            })
        else:
            assessment['strengths'].append(metric_info['display_name'])
    
    if metric_count > 0:
        assessment['overall_score'] = total_score / metric_count
    
    return assessment
