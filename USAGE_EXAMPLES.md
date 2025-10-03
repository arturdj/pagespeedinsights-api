# Azion PageSpeed Analyzer - Usage Examples

## 🚀 Quick Start

### 1. Interactive Mode (Recommended for first-time users)
```bash
python azion_analyzer.py --interactive
```

**What happens:**
- Guided setup with prompts
- Choose analysis type (PageSpeed only or CrUX + PageSpeed)
- Select device type and options
- Automatic report generation

### 2. Basic Analysis
```bash
python azion_analyzer.py --url https://example.com
```

**Output:**
- HTML report: `reports/azion_analysis_mobile_20251003_151126.html`
- Azion solution recommendations
- Performance scores and issues

### 3. Comprehensive Analysis with CrUX
```bash
python azion_analyzer.py --url https://example.com --crux --device desktop --weeks 30
```

**Features:**
- Historical Core Web Vitals data (30 weeks)
- PageSpeed Insights integration
- Timeline charts with real user data
- Desktop-specific analysis

### 4. Marketing Campaign Generation
```bash
python azion_analyzer.py --url https://example.com --crux --output-json campaign_data.json
```

**Output JSON Structure:**
```json
{
  "url": "https://example.com",
  "analysis": {
    "performance": {"score": 65, "issues": [...]},
    "accessibility": {"score": 85, "issues": [...]},
    "best_practices": {"score": 75, "issues": [...]},
    "seo": {"score": 90, "issues": [...]}
  },
  "azion_recommendations": {
    "recommendations": [
      {
        "category": "performance",
        "issue": {"title": "Reduce server response times", "impact": "high"},
        "azion_solution": {
          "priority": "high",
          "description": "Slow server response times can be dramatically improved with edge caching",
          "solutions": [
            {"name": "Edge Cache", "description": "Intelligent caching at the edge"},
            {"name": "Load Balancer", "description": "Traffic distribution and failover"}
          ]
        }
      }
    ],
    "marketing_data": {
      "summary": {
        "total_issues": 8,
        "high_priority_issues": 3,
        "potential_solutions": ["edge_cache", "image_processor", "waf"]
      }
    }
  },
  "marketing_pitch": {
    "executive_summary": {
      "website": "https://example.com",
      "issues_found": 8,
      "critical_issues": 3,
      "potential_impact": "High"
    },
    "value_proposition": {
      "performance_improvement": "Up to 40% faster loading times",
      "cost_reduction": "Reduce bandwidth costs by 30-60%",
      "security_enhancement": "Enterprise-grade security protection"
    },
    "solution_highlights": [
      {
        "name": "Edge Cache",
        "description": "Intelligent caching at the edge to reduce server load",
        "key_benefits": ["Reduces TTFB", "Improves loading", "Reduces costs"]
      }
    ]
  }
}
```

## 🎯 Real-World Scenarios

### Scenario 1: E-commerce Site Analysis
```bash
# Comprehensive analysis for an online store
python azion_analyzer.py --url https://mystore.com --crux --device mobile --weeks 40 --open
```

**Expected Azion Solutions:**
- **Image Processor**: For product image optimization
- **Edge Cache**: For faster page loads
- **WAF**: For security protection
- **Load Balancer**: For handling traffic spikes

### Scenario 2: News Website
```bash
# Fast analysis for content-heavy site
python azion_analyzer.py --url https://news-site.com --device desktop
```

**Expected Azion Solutions:**
- **Edge Functions**: For content personalization
- **Tiered Cache**: For article caching
- **Edge DNS**: For faster resolution

### Scenario 3: SaaS Application
```bash
# Security-focused analysis
python azion_analyzer.py --url https://app.saas.com --crux --output-json saas_analysis.json
```

**Expected Azion Solutions:**
- **WAF**: For application security
- **Edge Functions**: For API optimization and error handling
- **Load Balancer**: For high availability
- **Applications**: For console error monitoring and resolution

### Scenario 4: Debugging JavaScript Errors
```bash
# Analysis focusing on console errors and client-side issues
python azion_analyzer.py --url https://webapp.com --device desktop --open
```

**Console Error Analysis Features:**
- **Error Detection**: Identifies JavaScript console errors and warnings
- **Source Location**: Shows exact file, line, and column of errors
- **Error Classification**: Categorizes by error type (console.error, console.warn, etc.)
- **Azion Solutions**: Maps to Edge Functions, Applications, and Firewall for error handling

## 📊 Understanding the Output

### HTML Report Sections

1. **Header**: Overall scores and summary with Azion branding
2. **CrUX Timeline**: Historical performance data (if available)
3. **Category-Based Analysis**: 
   - **Performance** (Orange): Core Web Vitals, loading optimization
   - **Accessibility** (Green): WCAG compliance, ARIA improvements
   - **Best Practices** (Blue): Security, console errors, modern standards
   - **SEO** (Yellow): Meta tags, structured data, crawlability
4. **Console Error Details**: JavaScript errors with source locations (if found)
5. **Azion Recommendations**: Prioritized solution mappings with original PageSpeed context
6. **Marketing Summary**: Executive-friendly metrics and ROI projections

### Priority Levels

- **🔴 HIGH**: Critical performance issues (score < 50%)
- **🟡 MEDIUM**: Improvement opportunities (score 50-90%)
- **🟢 LOW**: Minor optimizations (score > 90%)

### Azion Solution Categories

| Category | Solutions | Use Cases |
|----------|-----------|-----------|
| **Performance** | Edge Cache, Tiered Cache, Applications | Slow loading, high TTFB, compression |
| **Images** | Image Processor | Large images, old formats, WebP/AVIF conversion |
| **Security** | WAF, Edge Functions, Applications | Vulnerabilities, attacks, console errors |
| **Availability** | Load Balancer | Traffic spikes, failover, distribution |
| **Edge Computing** | Edge Functions | Custom logic, headers, real-time processing |
| **Source Code** | Best Practices Review | Unused code, legacy JS, accessibility fixes |
| **DNS & Networking** | Edge DNS | DNS lookup delays, traffic management |
| **Storage** | Object Storage | Static assets, media files, backups |

## 🔧 Troubleshooting

### Common Issues

#### 1. API Key Not Found
```bash
❌ Error: PageSpeed Insights API key not found
```

**Solution:**
```bash
export PAGESPEED_INSIGHTS_API_KEY='your-api-key-here'
```

#### 2. CrUX Data Unavailable
```bash
⚠️ CrUX data unavailable: Insufficient data
```

**What happens:** Tool continues with PageSpeed-only analysis
**Why:** Site doesn't have enough traffic in Chrome UX Report dataset

#### 3. Network Timeout
```bash
❌ API error: Network timeout
```

**Solution:** Check internet connection and try again

#### 4. No Console Errors Found
```bash
ℹ️ No console errors detected in PageSpeed analysis
```

**What this means:** The website has clean JavaScript execution
**Note:** Console errors are only detected if they occur during PageSpeed Insights analysis

#### 5. Test Suite Failures
```bash
❌ Some tests failed. Check the errors above.
```

**Solution:** Run the test suite to identify issues:
```bash
python test_azion_analyzer.py
```

### Best Practices

1. **Use CrUX for established sites** (high traffic) - Sites need sufficient Chrome user data
2. **Start with mobile analysis** (most users) - Mobile-first performance optimization
3. **Generate JSON for campaign data** (marketing teams) - Structured data for automation
4. **Run analysis regularly** (monthly recommended) - Track performance improvements
5. **Test before deployment** - Use `python test_azion_analyzer.py` to validate setup
6. **Use interactive mode first** - Familiarize yourself with options before automation

## 🎪 Advanced Usage

### Batch Analysis Script
```bash
#!/bin/bash
# Analyze multiple sites
sites=("https://site1.com" "https://site2.com" "https://site3.com")

for site in "${sites[@]}"; do
    echo "Analyzing $site..."
    python azion_analyzer.py --url "$site" --crux --output-json "$(basename "$site")_analysis.json"
done
```

### Integration with CI/CD
```yaml
# GitHub Actions example
name: Azion Performance Analysis

on:
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Monday
  workflow_dispatch:

jobs:
  performance-analysis:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
        
    - name: Install dependencies
      run: pip install -r requirements.txt
      
    - name: Run Performance Analysis
      env:
        PAGESPEED_INSIGHTS_API_KEY: ${{ secrets.PAGESPEED_API_KEY }}
      run: |
        python azion_analyzer.py --url ${{ env.SITE_URL }} --crux --output-json performance_report.json
        
    - name: Upload Report
      uses: actions/upload-artifact@v3
      with:
        name: performance-report
        path: |
          performance_report.json
          reports/*.html
```

## 📈 Marketing Campaign Usage

The JSON output is designed for marketing automation:

1. **Lead Qualification**: Use `total_issues` and `critical_issues` to score leads
2. **Solution Targeting**: Map `azion_recommendations` to product demos
3. **Value Proposition**: Use `marketing_pitch` for personalized outreach
4. **ROI Calculation**: Leverage `potential_savings` data for proposals
5. **Campaign Personalization**: Use specific issue types to tailor messaging
6. **Technical Demos**: Reference specific Azion solutions from recommendations

### Sales Team Workflow
```bash
# 1. Analyze prospect's website
python azion_analyzer.py --url https://prospect.com --crux --output-json prospect_analysis.json

# 2. Review generated marketing pitch
cat prospect_analysis.json | jq '.marketing_pitch'

# 3. Generate follow-up report
python azion_analyzer.py --url https://prospect.com --open
```

## 🎯 Key Features Summary

The Azion PageSpeed Analyzer provides:

### **Comprehensive Analysis**
- **80+ PageSpeed Audits**: Covers all performance, accessibility, security, and SEO aspects
- **Console Error Detection**: Identifies JavaScript errors with source locations
- **Category-Based Reporting**: Color-coded sections for different optimization areas
- **Original Context Preservation**: Includes Google's PageSpeed Insights explanations

### **Azion Platform Integration**
- **50+ Solution Mappings**: Maps issues to specific Azion products and services
- **Priority System**: High/Medium/Low priority recommendations
- **Edge vs Source Code**: Distinguishes between edge optimizations and code changes
- **Best Practices Review**: Expert consultation for complex source code issues

### **Marketing-Ready Output**
- **Executive Summaries**: High-level metrics for decision makers
- **ROI Projections**: Quantified benefits and potential savings
- **Campaign Data**: Structured JSON for marketing automation
- **Visual Reports**: Professional HTML reports with Azion branding

### **Robust Architecture**
- **Error Resilience**: Continues processing despite API failures
- **Flexible Data Sources**: Works with PageSpeed only or PageSpeed + CrUX
- **Interactive & Automated**: Supports both guided and command-line usage
- **Comprehensive Testing**: Full test suite for validation

---

**Ready to start optimizing with Azion Platform?** 🚀
