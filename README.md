# Azion PageSpeed Analyzer

A marketing-focused performance analysis tool that maps PageSpeed Insights recommendations to **Azion Platform solutions** for generating targeted marketing campaigns.

**🎉 Now fully converted to JavaScript/Node.js!**

## 🎯 Main Goals

- **Interactive CLI** and argument-based usage
- **Map performance issues** to specific Azion Platform solutions  
- **Generate unified HTML reports** with Azion recommendations
- **Output structured JSON** for marketing campaign generation
- **Robust error handling** with best-effort approach
- **Integrate CrUX History** with PageSpeed Insights data

## 🚀 Features

### ✅ **Completed Core Features**

1. **Interactive CLI Interface**
   - Guided setup for non-technical users
   - Argument-based usage for automation
   - Device selection (mobile/desktop/tablet)
   - CrUX integration options

2. **Azion Platform Solution Mapping**
   - Maps 40+ PageSpeed audit types to Azion solutions
   - Prioritizes recommendations (high/medium/low)
   - Covers Edge Cache, Image Processor, WAF, Edge Functions, etc.

3. **Unified HTML Reports**
   - Single comprehensive report file
   - Azion-branded styling with marketing focus
   - Core Web Vitals timeline (when CrUX available)
   - Actionable Azion solution recommendations

4. **Marketing Campaign JSON Output**
   - Structured issue → solution mappings
   - Executive summary with impact metrics
   - Solution highlights and value propositions
   - Ready for LLM-based campaign generation

5. **Robust Error Handling**
   - Continues processing when CrUX data unavailable
   - Graceful API failure handling
   - Best-effort approach to maximize output

## 📁 Project Structure

```
├── azion_analyzer.js          # Main application (JavaScript)
├── azion_solutions.js         # Azion Platform solution mappings (JavaScript)
├── crux_integration.js        # CrUX History data integration (JavaScript)
├── test_azion_analyzer.js     # Test suite (JavaScript)
├── package.json               # Node.js dependencies
├── .env.example              # Environment configuration
├── USAGE_EXAMPLES.md          # Real-world usage scenarios
└── reports/                  # Generated reports directory
```

## ✅ **Redesign Achievements**

This tool has been successfully redesigned from a technical analysis tool into a **marketing-focused platform** that:

- **Maps** 40+ PageSpeed audit types to specific Azion Platform solutions
- **Prioritizes** recommendations with high/medium/low priority system
- **Generates** unified HTML reports with Azion branding and marketing focus
- **Outputs** structured JSON data ready for LLM-based campaign generation
- **Handles** errors gracefully with best-effort approach
- **Supports** both interactive and automated usage modes

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **PageSpeed Insights API** and **Chrome UX Report API**
3. Create an **API Key**
4. Set environment variable:
```bash
export PAGESPEED_INSIGHTS_API_KEY='your-api-key-here'
```

Or create a `.env` file:
```bash
cp .env.example .env
# Edit .env and add your API key
```

### 3. Test Installation
```bash
npm test
# or
node test_azion_analyzer.js
```

## 🎮 Usage

### Interactive Mode (Recommended)
```bash
npm run interactive
# or
node azion_analyzer.js --interactive
```

### Command Line Usage

#### Basic PageSpeed Analysis
```bash
node azion_analyzer.js --url https://example.com
```

#### Comprehensive Analysis with CrUX History
```bash
node azion_analyzer.js --url https://example.com --crux --device desktop --weeks 30
```

#### Generate Marketing JSON
```bash
node azion_analyzer.js --url https://example.com --crux --output-json marketing_data.json
```

#### Open Report Automatically
```bash
node azion_analyzer.js --url https://example.com --open
```

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|  
| `--url` | Website URL to analyze | Required |
| `--device` | Device type: mobile, desktop | mobile |
| `--crux` | Include CrUX History data | false |
| `--weeks` | CrUX history weeks (1-40) | 25 |
| `--interactive` | Interactive guided mode | false |
| `--open` | Open report in browser | false |
| `--output-json` | Save marketing data as JSON | none |

## 🎯 Azion Platform Solutions

The tool maps PageSpeed issues to these Azion solutions:

| Solution | Use Cases | Benefits |
|----------|-----------|----------|
| **Edge Cache** | Slow server response, static content | Reduces TTFB, improves loading |
| **Image Processor** | Large images, old formats | WebP/AVIF conversion, compression |
| **Edge Functions** | Header manipulation, optimization | Custom logic at edge |
| **WAF** | Security issues, malicious requests | Protection, performance |
| **Load Balancer** | High traffic, availability | Distribution, failover |
| **Tiered Cache** | Cache optimization | Multi-layer caching |
| **Edge DNS** | DNS lookup delays | Fast resolution |
| **Applications** | Delivery optimization | Rules engine, device handling |

## 📊 Output Files

### HTML Report
- **Filename**: `azion_analysis_{device}_{timestamp}.html`
- **Content**: Unified performance analysis with Azion recommendations
- **Features**: 
  - Overall performance scores with Azion branding
  - Core Web Vitals timeline (if CrUX available)
  - Prioritized Azion solution recommendations
  - Marketing-focused summary metrics

### Marketing JSON
- **Filename**: `azion_marketing_data_{timestamp}.json`
- **Content**: Structured data for marketing campaigns
- **Structure**:
```json
{
  "url": "https://example.com",
  "analysis": { /* PageSpeed analysis */ },
  "azion_recommendations": { /* Solution mappings */ },
  "marketing_pitch": {
    "executive_summary": { /* Key metrics */ },
    "value_proposition": { /* Benefits */ },
    "solution_highlights": [ /* Azion products */ ],
    "next_steps": [ /* Action items */ ]
  }
}
```

## 🧪 Testing

Run the test suite to validate functionality:

```bash
npm test
# or
node test_azion_analyzer.js
```

Tests cover:
- Module imports and ES6 compatibility
- Azion solution mappings validation
- Sample data analysis and processing
- Marketing campaign data generation
- Environment setup and file operations
- Error handling and data validation
- Core functionality integration

## 📈 Marketing Campaign Integration

The JSON output is designed for LLM-based marketing campaign generation:

1. **Issue Analysis**: Categorized performance problems
2. **Solution Mapping**: Specific Azion products for each issue
3. **Value Metrics**: Quantified benefits and savings
4. **Executive Summary**: High-level impact assessment
5. **Action Plan**: Prioritized implementation steps

## 🔧 Error Handling

The tool implements robust error handling:

- **CrUX Data Unavailable**: Continues with PageSpeed-only analysis
- **API Failures**: Provides helpful error messages and suggestions
- **Missing Data**: Uses fallback values and continues processing
- **Network Issues**: Implements timeouts and retry logic

**Ready to optimize your website performance with Azion Platform?** 🚀
