#!/usr/bin/env python3
"""
Test script for Azion PageSpeed Analyzer
Validates the redesigned system functionality
"""

import os
import sys
from datetime import datetime

def test_imports():
    """Test that all modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        from azion_solutions import (
            get_azion_solutions_for_audit,
            generate_marketing_campaign_data,
            format_marketing_pitch,
            AZION_SOLUTIONS
        )
        print("✅ azion_solutions module imported successfully")
        
        from crux_integration import (
            get_crux_history,
            extract_pagespeed_core_vitals,
            process_crux_data,
            create_core_vitals_chart,
            assess_crux_performance
        )
        print("✅ crux_integration module imported successfully")
        
        import azion_analyzer
        print("✅ azion_analyzer module imported successfully")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False

def test_azion_solutions():
    """Test Azion solutions mapping"""
    print("\n🧪 Testing Azion solutions mapping...")
    
    try:
        from azion_solutions import get_azion_solutions_for_audit, AZION_SOLUTIONS
        
        # Test known audit ID
        solution = get_azion_solutions_for_audit('server-response-time')
        if solution:
            print(f"✅ Found {len(solution['solutions'])} Azion solutions for server-response-time")
            print(f"   Priority: {solution['priority']}")
            print(f"   Solutions: {[s['name'] for s in solution['solutions']]}")
        else:
            print("❌ No solutions found for server-response-time")
            return False
        
        # Test solution count
        print(f"✅ Total Azion solutions available: {len(AZION_SOLUTIONS)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Azion solutions: {str(e)}")
        return False

def test_sample_analysis():
    """Test analysis with sample data"""
    print("\n🧪 Testing sample analysis...")
    
    try:
        from azion_analyzer import analyze_pagespeed_data, generate_azion_recommendations
        
        # Sample PageSpeed data structure
        sample_data = {
            'lighthouseResult': {
                'categories': {
                    'performance': {'score': 0.65},
                    'accessibility': {'score': 0.85},
                    'best-practices': {'score': 0.75},
                    'seo': {'score': 0.90}
                },
                'audits': {
                    'server-response-time': {
                        'score': 0.3,
                        'title': 'Reduce server response times (TTFB)',
                        'description': 'Server response times are slow',
                        'displayValue': '1.2 s'
                    },
                    'modern-image-formats': {
                        'score': 0.4,
                        'title': 'Serve images in next-gen formats',
                        'description': 'Use WebP or AVIF for better compression',
                        'displayValue': 'Potential savings of 125 KB'
                    }
                }
            }
        }
        
        # Test analysis
        analysis = analyze_pagespeed_data(sample_data)
        if analysis:
            print("✅ Sample data analysis successful")
            print(f"   Performance score: {analysis['performance']['score']:.0f}")
            print(f"   Performance issues: {len(analysis['performance']['issues'])}")
        else:
            print("❌ Sample data analysis failed")
            return False
        
        # Test Azion recommendations
        recommendations = generate_azion_recommendations(analysis)
        if recommendations:
            print(f"✅ Generated {len(recommendations['recommendations'])} Azion recommendations")
            print(f"   Marketing data available: {'marketing_data' in recommendations}")
        else:
            print("❌ Failed to generate Azion recommendations")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing sample analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_html_generation():
    """Test HTML report generation"""
    print("\n🧪 Testing HTML report generation...")
    
    try:
        from azion_analyzer import generate_unified_html_report
        
        # Sample data
        sample_analysis = {
            'performance': {'score': 65, 'issues': []},
            'accessibility': {'score': 85, 'issues': []},
            'best_practices': {'score': 75, 'issues': []},
            'seo': {'score': 90, 'issues': []}
        }
        
        sample_recommendations = {
            'recommendations': [],
            'marketing_data': {'summary': {'total_issues': 5, 'high_priority_issues': 2}},
            'solution_count': 3
        }
        
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        html_report = generate_unified_html_report(
            'https://example.com',
            sample_analysis,
            sample_recommendations,
            timestamp
        )
        
        if html_report and len(html_report) > 1000:
            print("✅ HTML report generated successfully")
            print(f"   Report size: {len(html_report)} characters")
        else:
            print("❌ HTML report generation failed or too small")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing HTML generation: {str(e)}")
        return False

def test_environment():
    """Test environment setup"""
    print("\n🧪 Testing environment...")
    
    # Check for API key
    api_key = os.getenv('PAGESPEED_INSIGHTS_API_KEY')
    if api_key:
        print("✅ PageSpeed Insights API key found")
    else:
        print("⚠️ PageSpeed Insights API key not found (set PAGESPEED_INSIGHTS_API_KEY)")
    
    # Check reports directory
    reports_dir = './reports'
    if os.path.exists(reports_dir):
        print("✅ Reports directory exists")
    else:
        print("ℹ️ Reports directory will be created when needed")
    
    return True

def main():
    """Run all tests"""
    print("🚀 Azion PageSpeed Analyzer - Test Suite")
    print("=" * 50)
    
    tests = [
        ("Environment Setup", test_environment),
        ("Module Imports", test_imports),
        ("Azion Solutions", test_azion_solutions),
        ("Sample Analysis", test_sample_analysis),
        ("HTML Generation", test_html_generation)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"❌ {test_name} ERROR: {str(e)}")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The system is ready to use.")
        print("\nNext steps:")
        print("1. Set your API key: export PAGESPEED_INSIGHTS_API_KEY='your-key'")
        print("2. Run interactive mode: python azion_analyzer.py --interactive")
        print("3. Or analyze directly: python azion_analyzer.py --url https://example.com")
    else:
        print("⚠️ Some tests failed. Please check the errors above.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
