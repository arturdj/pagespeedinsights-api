#!/usr/bin/env python3
"""
Test script to verify that original PageSpeed Insights messages are preserved
"""

import json
from azion_analyzer import analyze_pagespeed_data

def test_pagespeed_context_preservation():
    """Test that original PageSpeed context is preserved in analysis"""
    print("🧪 Testing PageSpeed context preservation...")
    
    # Mock PageSpeed Insights data with realistic audit information
    mock_pagespeed_data = {
        'lighthouseResult': {
            'categories': {
                'performance': {'score': 0.65},
                'accessibility': {'score': 0.85},
                'best-practices': {'score': 0.75},
                'seo': {'score': 0.90}
            },
            'audits': {
                'server-response-time': {
                    'id': 'server-response-time',
                    'title': 'Reduce server response times (TTFB)',
                    'description': 'Time to First Byte identifies the time at which your server sends a response. [Learn more](https://web.dev/time-to-first-byte/).',
                    'score': 0.3,
                    'scoreDisplayMode': 'numeric',
                    'displayValue': '1,240 ms',
                    'numericValue': 1240.5,
                    'numericUnit': 'millisecond',
                    'explanation': 'Server response time is slow. Consider optimizing your server configuration.',
                    'details': {
                        'type': 'opportunity',
                        'overallSavingsMs': 740
                    },
                    'warnings': ['High server response time detected']
                },
                'unused-css-rules': {
                    'id': 'unused-css-rules',
                    'title': 'Reduce unused CSS',
                    'description': 'Reduce unused rules from stylesheets and defer CSS not used for above-the-fold content to decrease bytes consumed by network activity. [Learn more](https://web.dev/unused-css-rules/).',
                    'score': 0.4,
                    'scoreDisplayMode': 'bytes',
                    'displayValue': 'Potential savings of 45 KiB',
                    'numericValue': 46080,
                    'numericUnit': 'byte',
                    'details': {
                        'type': 'opportunity',
                        'overallSavingsBytes': 46080
                    }
                }
            }
        }
    }
    
    # Analyze the mock data
    analysis = analyze_pagespeed_data(mock_pagespeed_data)
    
    if not analysis:
        print("❌ Analysis failed")
        return False
    
    # Check if original PageSpeed data is preserved
    found_context = False
    for category_name, category_data in analysis.items():
        for issue in category_data.get('issues', []):
            if 'original_pagespeed_data' in issue:
                found_context = True
                original_data = issue['original_pagespeed_data']
                
                print(f"✅ Found original context for: {issue['title']}")
                print(f"   - Original description: {original_data.get('description', 'N/A')[:100]}...")
                print(f"   - Display value: {issue.get('display_value', 'N/A')}")
                print(f"   - Numeric value: {original_data.get('numeric_value', 'N/A')}")
                print(f"   - Numeric unit: {original_data.get('numeric_unit', 'N/A')}")
                
                if original_data.get('warnings'):
                    print(f"   - Warnings: {original_data['warnings']}")
                
                print()
    
    if found_context:
        print("✅ Original PageSpeed context is being preserved correctly!")
        return True
    else:
        print("❌ Original PageSpeed context not found in analysis")
        return False

def test_marketing_data_context():
    """Test that marketing data includes PageSpeed context"""
    print("🧪 Testing marketing data context inclusion...")
    
    from azion_solutions import generate_marketing_campaign_data
    
    # Mock analysis with original PageSpeed data
    mock_analysis = {
        'performance': {
            'score': 65,
            'issues': [{
                'id': 'server-response-time',
                'title': 'Reduce server response times (TTFB)',
                'description': 'Time to First Byte identifies the time at which your server sends a response.',
                'score': 0.3,
                'display_value': '1,240 ms',
                'impact': 'high',
                'original_pagespeed_data': {
                    'description': 'Time to First Byte identifies the time at which your server sends a response. [Learn more](https://web.dev/time-to-first-byte/).',
                    'explanation': 'Server response time is slow. Consider optimizing your server configuration.',
                    'numeric_value': 1240.5,
                    'numeric_unit': 'millisecond',
                    'warnings': ['High server response time detected']
                }
            }]
        }
    }
    
    # Generate marketing data
    marketing_data = generate_marketing_campaign_data(mock_analysis)
    
    # Check if action plan includes PageSpeed context
    if marketing_data.get('action_plan'):
        for action in marketing_data['action_plan']:
            if 'pagespeed_insights_context' in action:
                context = action['pagespeed_insights_context']
                print(f"✅ Found PageSpeed context in action plan:")
                print(f"   - Title: {action['title']}")
                print(f"   - Original description: {context.get('original_description', 'N/A')[:100]}...")
                print(f"   - Current value: {context.get('current_value', 'N/A')}")
                print(f"   - Score: {context.get('score', 'N/A')}")
                print(f"   - Numeric value: {context.get('numeric_value', 'N/A')} {context.get('numeric_unit', '')}")
                return True
    
    print("❌ PageSpeed context not found in marketing data")
    return False

if __name__ == "__main__":
    print("🚀 Testing PageSpeed Insights Context Preservation\n")
    
    success = True
    success &= test_pagespeed_context_preservation()
    success &= test_marketing_data_context()
    
    if success:
        print("\n✅ All tests passed! Original PageSpeed messages are properly preserved.")
    else:
        print("\n❌ Some tests failed. Check the implementation.")
