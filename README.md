# Azion PageSpeed Analyzer - TypeScript Edition

A professional TypeScript implementation of the Azion PageSpeed Analyzer with comprehensive API endpoints for website performance analysis and optimization recommendations. Supports both traditional server deployment and Azion Edge Functions.

## 🚀 Features

- **Edge Functions**: Runs on Azion's global edge network for ultra-low latency
- **PageSpeed Insights Integration**: Fetch and analyze performance data from Google's PageSpeed Insights API
- **CrUX Data Integration**: Include Chrome User Experience Report data with interactive charts
- **Azion Solutions Mapping**: Intelligent mapping of performance issues to Azion Platform solutions
- **HTML Report Generation**: Beautiful, comprehensive HTML reports with embedded charts
- **REST API**: Clean API endpoints for programmatic access
- **Enhanced Manual Interface**: User-friendly web interface with advanced features:
  - 📄 Expandable Full Response section with no data truncation
  - 📋 Universal copy functionality (works across all browsers)
  - 💾 Download buttons with real-time file size information
  - 📊 Response statistics (file size, line count)
  - 🎯 Multiple output formats (JSON, HTML, Combined, Structured Data)
- **TypeScript**: Fully typed codebase for better development experience
- **Global Distribution**: Deployed to Azion's edge network worldwide

## 📋 Requirements

- Node.js 18+ 
- TypeScript 5+
- Azion CLI
- Google PageSpeed Insights API Key
- Chrome User Experience Report API access (optional)

## 🛠️ Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Install Azion CLI globally (if not already installed):**
```bash
npm install -g azion
```

3. **Build the project:**
```bash
npm run build
```

4. **Start development server:**

**Local Express Server:**
```bash
npm run dev
```

**Azion Edge Functions (Local):**
```bash
npm run dev:edge
# or
azion dev
```

5. **Deploy to Azion Edge:**
```bash
npm run deploy
# or
azion deploy
```

## 📁 Project Structure

```
pagespeedinsights-api/
├── src/                          # Source code
│   ├── function/                 # Edge function handler
│   │   └── index.ts             # Main edge function entry point
│   ├── services/                # Business logic services
│   │   ├── analyzer.ts          # Main analysis orchestrator
│   │   ├── pagespeed.ts         # PageSpeed Insights API client
│   │   ├── crux.ts              # Chrome UX Report integration
│   │   ├── azion-solutions.ts   # Azion solutions mapping
│   │   └── report-generator.ts  # HTML report generation
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts             # Main types
│   │   ├── event.ts             # Edge function event types
│   │   └── global.d.ts          # Global type declarations
│   ├── utils/                   # Shared utilities (NEW)
│   │   ├── validation.ts        # Request validation logic
│   │   ├── error-handling.ts    # Unified error handling
│   │   ├── manual-interface-styles.ts # CSS styles
│   │   └── manual-interface-template.ts # HTML/JS template
│   └── server.ts                # Express server (for local development)
├── azion/                       # Azion deployment configuration
│   ├── azion.json              # Azion project settings
│   └── args.json               # Deployment arguments
├── .edge/                       # Build output (generated)
├── index.ts                     # Edge function entry point
├── example.js                   # Usage examples
├── start.sh                     # Quick start script
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## 🌐 Edge Functions Deployment

This project is configured to run on **Azion Edge Functions** with the following benefits:

- **Global Distribution**: Your API runs on 100+ edge locations worldwide
- **Ultra-Low Latency**: Responses served from the nearest edge location
- **Auto-Scaling**: Automatically scales based on demand
- **High Availability**: Built-in redundancy and failover
- **Cost Effective**: Pay only for what you use

### Development vs Production

**Development (Local Express):**
```bash
npm run dev        # Runs Express server locally
```

**Development (Local Edge Functions):**
```bash
npm run dev:edge   # Runs locally with azion dev
```

**Production (Edge):**
```bash
npm run deploy     # Deploys to Azion Edge Network
```

## 📜 Available Scripts

### **Local Development:**
- `npm run dev` - Start Express server locally with hot reload
- `npm run dev:edge` - Start Azion Edge Functions locally

### **Build & Deploy:**
- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:edge` - Build for Azion Edge Functions
- `npm run deploy` - Deploy to Azion Edge Network
- `npm run start` - Start the production Express server

### **Utilities:**
- `npm run clean` - Remove compiled files (dist/ and .edge/)
- `npm run rebuild` - Clean and rebuild the project
- `npm test` - Run tests (placeholder)

## 🔧 API Endpoints

### `POST /analyze`
Analyze website performance and get Azion recommendations.

**Request Body:**
```json
{
  "url": "https://example.com",
  "api_key": "your-pagespeed-api-key",
  "device": "mobile",
  "use_crux": true,
  "weeks": 25,
  "follow_redirects": false
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "device": "mobile",
  "timestamp": "2025-10-17 21:35:00",
  "analysis": {
    "performance": { "score": 85, "issues": [...] },
    "accessibility": { "score": 92, "issues": [...] },
    "best_practices": { "score": 88, "issues": [...] },
    "seo": { "score": 95, "issues": [...] }
  },
  "azion_recommendations": {
    "recommendations": [...],
    "marketing_data": {...},
    "solution_count": 8
  },
  "crux_data": {...},
  "html_report": "<!DOCTYPE html>...",
  "marketing_pitch": {...}
}
```

### `POST /report`
Generate and return an HTML performance report.

**Request Body:** Same as `/analyze`

**Response:** HTML document with comprehensive performance analysis

### `POST /full`
Get both JSON analysis and HTML report in a single response.

**Request Body:** Same as `/analyze`

**Response:**
```json
{
  "url": "https://example.com",
  "device": "mobile",
  "analysis": {...},
  "azion_recommendations": {...},
  "crux_data": {...},
  "html_report": "<!DOCTYPE html>...",
  "marketing_pitch": {...}
}
```

### `POST /html-json`
Get structured data values used to populate HTML reports for programmatic access.

**Request Body:** Same as `/analyze`

**Response:**
```json
{
  "url": "https://example.com",
  "device": "mobile",
  "report_data": {
    "header": {...},
    "overall_score": {...},
    "category_scores": [...],
    "optimization_summary": {...},
    "categories": {...},
    "crux_data": {...},
    "marketing_pitch": {...}
  }
}
```

### `GET /manual`
Interactive web interface for manual testing and configuration with enhanced features:

**Key Features:**
- 🔧 **Configuration Panel**: Easy form-based setup for URL, device type, and options
- 🔄 **Follow URL Redirects**: Option to automatically follow HTTP redirects before analysis
- 📋 **Request Format Examples**: Auto-generated cURL, JavaScript, and Python code samples
- 📊 **Real-time Progress Tracking**: Dynamic progress bar with step-by-step logging
- 📋 **Collapsible Log View**: Color-coded log entries (INFO, SUCCESS, WARNING, ERROR)
- ⏱️ **Elapsed Time Tracking**: Analysis duration display in results header
- 📄 **Expandable Full Response**: Collapsible section showing complete response data without truncation
- 💾 **Smart Downloads**: Download buttons with real-time file size information
- 📊 **Response Statistics**: Live file size and line count display
- 🎯 **Multiple Output Types**:
  - JSON Analysis: Complete performance data
  - HTML Report: Downloadable performance report
  - Full JSON + HTML: Combined analysis and report
  - HTML in JSON Format: Structured data for programmatic access
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

### `GET /health`
Health check endpoint.

### `GET /docs`
API documentation with examples.

## 🌐 Usage Examples

### cURL
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "api_key": "your-api-key",
    "device": "mobile",
    "use_crux": true,
    "weeks": 25,
    "follow_redirects": false
  }' \
  http://localhost:3000/analyze
```

### JavaScript Fetch
```javascript
fetch('http://localhost:3000/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com',
    api_key: 'your-api-key',
    device: 'mobile',
    use_crux: true,
    weeks: 25,
    follow_redirects: false
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Python
```python
import requests

data = {
    "url": "https://example.com",
    "api_key": "your-api-key",
    "device": "mobile",
    "use_crux": True,
    "weeks": 25,
    "follow_redirects": False
}

response = requests.post('http://localhost:3000/analyze', json=data)
result = response.json()
print(result)
```

## 🔑 API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the PageSpeed Insights API
4. Enable the Chrome UX Report API (for CrUX data)
5. Create credentials (API Key)
6. Use the API key in your requests

**Quick Start with Manual Interface:**
1. Start the server: `npm run dev`
2. Open `http://localhost:3000/manual` in your browser
3. Enter your website URL and API key
4. Select device type and output format
5. Click "Execute Request" to analyze
6. Use the expandable "Full Response" section to view complete data
7. Download results with file size information clearly displayed

## 📊 Features Overview

### Performance Analysis
- **Core Web Vitals**: LCP, FID, CLS, INP, TTFB
- **Performance Metrics**: Speed Index, Total Blocking Time, etc.
- **Accessibility Audits**: WCAG compliance checks
- **SEO Analysis**: Meta tags, structured data, crawlability
- **Best Practices**: Security, modern standards compliance

### Azion Solutions Integration
- **Edge Applications**: Global content delivery and optimization
- **Edge Functions**: Serverless computing at the edge
- **Image Processor**: Automatic image optimization and format conversion
- **Edge Cache**: Multi-layer caching architecture
- **Edge Firewall**: Comprehensive security protection
- **Load Balancer**: Intelligent traffic distribution
- **Best Practices Review**: Expert optimization recommendations

### Report Generation
- **Interactive Charts**: Core Web Vitals timeline with Plotly.js
- **Detailed Recommendations**: Prioritized optimization suggestions
- **Console Error Analysis**: JavaScript error detection and reporting
- **Marketing Data**: Campaign-ready performance insights
- **Professional Design**: Modern, responsive HTML reports

## 🏗️ Architecture

The project follows a **modular, DRY (Don't Repeat Yourself) architecture** with shared utilities:

```
src/
├── function/           # Edge function implementation
│   └── index.ts           # Edge function handler
├── services/           # Core business logic services
│   ├── analyzer.ts         # Main orchestration service
│   ├── pagespeed.ts        # PageSpeed Insights integration
│   ├── azion-solutions.ts  # Azion solutions mapping
│   ├── crux.ts             # CrUX data processing
│   └── report-generator.ts # HTML report generation
├── types/              # TypeScript interfaces and types
│   ├── index.ts            # Main type definitions
│   ├── event.ts            # Edge function event types
│   └── global.d.ts         # Global declarations
├── utils/              # Shared utilities (eliminates duplication)
│   ├── validation.ts       # Unified request validation
│   ├── error-handling.ts   # Standardized error responses
│   ├── manual-interface-styles.ts # CSS styles
│   └── manual-interface-template.ts # HTML/JS template
└── server.ts           # Express API server (local development)
```

### **Key Architectural Benefits:**
- **🔄 No Code Duplication**: Shared utilities eliminate 1000+ lines of duplicated code
- **🛡️ Type Safety**: Full TypeScript coverage with strict typing
- **🎯 Single Source of Truth**: Manual interface, validation, and error handling centralized
- **🚀 Dual Deployment**: Same codebase runs on Express.js and Azion Edge Functions
- **🧩 Modular Design**: Easy to maintain, test, and extend individual components

## 🚦 Development

### Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (placeholder)

### Environment Variables
- `PORT` - Server port (default: 3000)

## 🔒 Security Notes

- API keys are not stored or logged
- All requests are validated and sanitized
- CORS is enabled for cross-origin requests
- No file system access - everything runs in memory

## 🎯 Key Differences from Python Version

1. **No CLI Interface** - Pure API-based approach
2. **No File System** - All processing in memory
3. **TypeScript Types** - Full type safety and IntelliSense
4. **REST API** - Clean HTTP endpoints instead of command-line
5. **Enhanced Manual Interface** - Advanced web-based testing interface with:
   - Expandable response sections
   - Universal copy functionality
   - Real-time file size information
   - Multiple output format support
6. **Vanilla Dependencies** - Minimal external dependencies
7. **Professional Architecture** - Service-based modular design
8. **Multiple API Endpoints** - Specialized endpoints for different use cases

## 📈 Performance

- **Fast Analysis**: Optimized API calls and data processing
- **Memory Efficient**: No file system operations
- **Concurrent Requests**: Express.js handles multiple simultaneous analyses
- **Error Handling**: Robust error handling and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the `/docs` endpoint for API documentation
- Use the `/manual` interface for interactive testing
- Review the console logs for debugging information

---

**Ready to optimize your website with Azion's edge platform? Start analyzing today!** 🚀
