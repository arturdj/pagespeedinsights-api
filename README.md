# Azion PageSpeed Analyzer API

A TypeScript-based Edge Function API that analyzes website performance using Google PageSpeed Insights and generates Azion-specific optimization recommendations. Built exclusively for Azion Edge Functions with a modern, streamlined architecture.

## 🚀 Features

- **Performance Analysis**: Complete website performance analysis using PageSpeed Insights API
- **Azion Solutions Mapping**: Intelligent mapping of performance issues to specific Azion products and solutions
- **CrUX Data Integration**: Chrome User Experience Report data for real user metrics
- **Multiple Output Formats**: JSON data, HTML reports, and structured solutions
- **Interactive Manual Interface**: Real-time testing interface with progress tracking and detailed logging
- **Edge Function Native**: Optimized for Azion's global edge network
- **TypeScript**: Full type safety and modern development experience

## 📡 API Endpoints

### Core Analysis Endpoints

#### `POST /analyze`
Returns detailed performance analysis in JSON format (analysis data only, no HTML report).

#### `POST /report`
Generates and returns an HTML performance report.

#### `POST /full`
Returns complete analysis with both JSON data and HTML report included.

#### `POST /solutions`
Returns structured Azion solutions and optimization insights in JSON format optimized for LLMs and tools.

### Utility Endpoints

#### `GET /health`
Health check endpoint returning service status.

#### `GET /manual`
Interactive manual testing interface with real-time progress tracking.

#### `GET /docs`
API documentation endpoint.

### Request Parameters

All analysis endpoints accept the same request body:

```json
{
  "url": "https://example.com",
  "device": "mobile",
  "use_crux": false,
  "weeks": 25,
  "follow_redirects": false
}
```

**Parameters:**
- **url** (required): The website URL to analyze
- **device** (optional): Device type - `mobile`, `desktop`, or `tablet` (default: `mobile`)
- **use_crux** (optional): Include Chrome User Experience Report data (default: `false`)
- **weeks** (optional): Number of weeks of CrUX data to fetch (default: `25`)
- **follow_redirects** (optional): Automatically follow HTTP redirects before analysis (default: `false`)

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Google PageSpeed Insights API key
- Azion CLI

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pagespeedinsights-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   For **development**, create a `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and add your PageSpeed Insights API key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3333`

### Getting a PageSpeed Insights API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the PageSpeed Insights API
4. Create credentials (API key)
5. For **development**: Add the API key to your `.env` file
6. For **production**: Configure as an Azion Platform Environment Variable

## 🚀 Deployment

### Azion Edge Functions

1. **Install Azion CLI**
   ```bash
   npm install -g azion
   ```

2. **Login to Azion**
   ```bash
   azion login
   ```

3. **Configure API Key for Production**
   
   Set up the API key as an **Azion Platform Environment Variable**:
   - Go to your Azion Console
   - Navigate to Edge Functions
   - Select your function
   - Add environment variable: `PAGESPEED_INSIGHTS_API_KEY`

4. **Deploy to Azion**
   ```bash
   npm run deploy
   ```

## 📁 Project Structure

```
src/
├── function/
│   └── index.ts                    # Azion Edge Function entry point
├── services/
│   ├── analyzer.ts                 # Core analysis service
│   ├── azion-solutions.ts          # Azion solutions mapping
│   ├── crux.ts                     # Chrome UX Report service
│   ├── pagespeed.ts               # PageSpeed Insights API client
│   └── report.ts                  # HTML report generation
├── types/
│   ├── event.ts                   # Edge function types
│   ├── global.d.ts                # Global type definitions
│   └── index.ts                   # Core type definitions
└── utils/
    ├── error-handling.ts          # Unified error handling
    ├── manual-interface-styles.ts # CSS styles for manual interface
    ├── manual-interface-template.ts # HTML template for manual interface
    └── validation.ts              # Request validation utilities
```

## 💻 Usage Examples

### cURL Examples

**Basic Analysis:**
```bash
curl -X POST https://your-domain.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Desktop Analysis with CrUX Data:**
```bash
curl -X POST https://your-domain.com/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "device": "desktop",
    "use_crux": true,
    "follow_redirects": true
  }'
```

**Get Azion Solutions:**
```bash
curl -X POST https://your-domain.com/solutions \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Generate HTML Report:**
```bash
curl -X POST https://your-domain.com/report \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  -o report.html
```

### JavaScript/Node.js Example

```javascript
const response = await fetch('https://your-domain.com/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com',
    device: 'mobile',
    use_crux: true,
    follow_redirects: true
  })
});

const analysis = await response.json();
console.log(analysis);
```

## 📊 Response Formats

### Analysis Response (`/analyze`, `/full`)

```json
{
  "url": "https://example.com",
  "final_url": "https://example.com",
  "device": "mobile",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "analysis": {
    "performance": {
      "score": 85,
      "issues": [...]
    },
    "accessibility": {
      "score": 92,
      "issues": [...]
    },
    "best_practices": {
      "score": 88,
      "issues": [...]
    },
    "seo": {
      "score": 95,
      "issues": [...]
    }
  },
  "azion_recommendations": {
    "solution_count": 5,
    "marketing_data": {...}
  },
  "crux_data": {...},
  "html_report": "..." // Only included in /full endpoint
}
```

### Solutions Response (`/solutions`)

The `/solutions` endpoint returns structured data optimized for LLMs and tools:

```json
{
  "metadata": {
    "url": "https://example.com",
    "overall_performance_score": 85,
    "total_issues_detected": 12,
    "api_version": "3.0.0"
  },
  "performance_assessment": {
    "scores_by_category": {...},
    "issues_breakdown": {
      "high_priority": {...},
      "medium_priority": {...},
      "low_priority": {...}
    }
  },
  "azion_solutions": {
    "summary": {...},
    "recommended_products": [...],
    "implementation_roadmap": [...]
  },
  "optimization_insights": {
    "quick_wins": [...],
    "major_improvements": [...],
    "console_errors": {...}
  },
  "next_steps": {...}
}
```

## 🏗️ Architecture Benefits

### Edge Function Advantages
- **Global Distribution**: Deployed to Azion's edge network for low latency
- **Serverless**: No server management required
- **Auto-scaling**: Handles traffic spikes automatically
- **Cost-effective**: Pay only for actual usage

### Modern Architecture (v3.0.0+)
- **Edge Function Native**: Optimized exclusively for Azion Edge Functions
- **Simplified Dependencies**: Minimal footprint with only essential packages
- **Better Performance**: Native edge execution without Express.js overhead
- **Easier Maintenance**: Single deployment target and architecture

### Code Quality (v2.0.0+)
- **Eliminated 1000+ lines of duplicated code**
- **Single source of truth** for manual interface, validation, and error handling
- **Unified user experience** with shared utilities in `src/utils/`
- **Modular architecture** supporting future enhancements

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start Azion Edge Functions locally (port 3333)

# Building
npm run build        # Build for Azion Edge Functions

# Deployment
npm run deploy       # Deploy to Azion Edge Network

# Utilities
npm run clean        # Remove build artifacts (.edge/ directory)
npm test            # Run tests (placeholder)
```

## 🔐 Environment Configuration

### Development (.env file)
```bash
PAGESPEED_INSIGHTS_API_KEY=your-api-key-here
```

### Production (Azion Platform Environment Variable)
Configure the API key as an **Azion Platform Environment Variable**:
1. Go to your Azion Console
2. Navigate to Edge Functions
3. Select your function
4. Add environment variable: `PAGESPEED_INSIGHTS_API_KEY=your-api-key-here`

## ⚠️ Error Handling

The API uses standardized error responses:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request parameters",
    "details": "URL is required",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Common Error Codes:**
- `VALIDATION_FAILED`: Invalid request parameters
- `API_KEY_MISSING`: PageSpeed Insights API key not configured
- `PAGESPEED_API_ERROR`: Error from PageSpeed Insights API
- `ANALYSIS_FAILED`: General analysis failure
- `REPORT_GENERATION_FAILED`: HTML report generation error

## 🎯 Manual Interface Features

The `/manual` endpoint provides an interactive testing interface with:

- **Real-time Progress Tracking**: Dynamic progress bars with step-by-step updates
- **Collapsible Log View**: Color-coded log entries (INFO, SUCCESS, WARNING, ERROR)
- **Elapsed Time Display**: Analysis duration tracking
- **Multiple Output Types**: Switch between JSON analysis, HTML reports, and Azion solutions
- **Follow Redirects Option**: Test redirect handling functionality
- **Download & Copy Actions**: Easy result sharing and saving

## 📚 API Documentation

Visit the `/docs` endpoint for complete API documentation, or use the interactive manual interface at `/manual` for hands-on testing.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (when test suite is implemented)
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the GitHub Issues
2. Review the API documentation at `/docs` endpoint
3. Use the manual interface at `/manual` for testing
4. Consult the Azion documentation for Edge Functions
