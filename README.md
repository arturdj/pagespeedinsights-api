# PageSpeed Insights & CrUX History Report Generator

This tool generates comprehensive performance and security reports for websites using Google's PageSpeed Insights API and Chrome UX Report (CrUX) History API.

## Features

- 📊 Analyzes both mobile and desktop performance
- 📈 **NEW: CrUX History data with interactive time-series visualizations**
- 🎨 Generates beautiful, user-friendly HTML reports
- 📄 Exports raw data in JSON format
- 🔍 Provides detailed recommendations for improvement
- ⚡ Shows key performance metrics (FCP, LCP, CLS, INP, TTFB, etc.)
- 🎯 Includes scores for Performance, SEO, Accessibility, and Best Practices
- 📉 **NEW: Historical trends showing up to 40 weeks of real user data**
- 🎭 **NEW: Interactive Plotly charts with distribution graphs**

## Prerequisites

1. **Python 3.6 or higher**
2. **A Google Cloud Platform (GCP) account** with the PageSpeed Insights API enabled
3. **A PageSpeed Insights API key**

## Getting Your API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the required APIs:
   - Navigate to "APIs & Services" > "Library"
   - Search for "PageSpeed Insights API" and click "Enable"
   - Search for "Chrome UX Report API" and click "Enable" (for CrUX History features)
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

**Note**: The same API key works for both PageSpeed Insights and CrUX History APIs.

## Setup

1. **Install the required packages:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set your PageSpeed Insights API key as an environment variable:**

   **On macOS/Linux:**
   ```bash
   export PAGESPEED_INSIGHTS_API_KEY='your-api-key-here'
   ```

   **On Windows (Command Prompt):**
   ```cmd
   set PAGESPEED_INSIGHTS_API_KEY=your-api-key-here
   ```

   **On Windows (PowerShell):**
   ```powershell
   $env:PAGESPEED_INSIGHTS_API_KEY='your-api-key-here'
   ```

   **To make it permanent (macOS/Linux):**
   Add the export command to your `~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`

## Usage

The script uses **command-line arguments** for all operations. Run with `--help` to see all options:

```bash
python pagespeed_report.py --help
```

### Basic Commands

#### 1. Analyze a URL with PageSpeed Insights
```bash
python pagespeed_report.py --url https://example.com
```

This will:
- Test both mobile and desktop performance
- Generate JSON and HTML reports
- Save reports in the `./reports` directory

#### 2. Get CrUX History Data (Historical Trends)
```bash
python pagespeed_report.py --crux --url https://example.com
```

Optional parameters:
- `--device phone|desktop|tablet` - Device type (default: phone)
- `--weeks N` - Number of weeks of data (1-40, default: 25)
- `--recommendations` - Include PageSpeed Insights recommendations and performance assessment

Example with options:
```bash
python pagespeed_report.py --crux --url https://example.com --device desktop --weeks 30
```

#### 2a. Get CrUX Data with Performance Assessment & Recommendations (NEW!)
```bash
python pagespeed_report.py --crux --url https://example.com --recommendations
```

This enhanced mode combines:
- **Historical CrUX data** showing performance trends over time
- **Performance assessment** based on latest real user data
- **PageSpeed Insights recommendations** with actionable optimization tips

#### 3. Process Existing JSON Report
```bash
python pagespeed_report.py --json report.json
```

This regenerates HTML reports from previously saved JSON data (no API call needed).

#### 4. Open Report in Browser Automatically
Add the `--open` flag to any command:
```bash
python pagespeed_report.py --url https://example.com --open
python pagespeed_report.py --crux --url https://example.com --open
```

### Examples

**Analyze a website:**
```bash
$ python pagespeed_report.py --url example.com

🔍 Analyzing https://example.com (this may take a moment)...
📱 Testing mobile performance...
💻 Testing desktop performance...

✅ Reports generated successfully!

📄 Files created:
  • JSON Report: reports/pagespeed_report_20250930_160739.json
  • Mobile HTML Report: reports/pagespeed_report_mobile_20250930_160739.html
  • Desktop HTML Report: reports/pagespeed_report_desktop_20250930_160739.html
```

**Get CrUX historical data for desktop:**
```bash
$ python pagespeed_report.py --crux --url https://example.com --device desktop --weeks 40

🔍 Fetching CrUX History data for https://example.com...
   Device: DESKTOP
   Periods: 40 weeks

⏳ This may take a moment...
📊 Generating visualizations...

✅ CrUX History report generated successfully!

📄 Files created:
  • JSON Data: reports/crux_history_20250930_160739.json
  • HTML Report: reports/crux_history_desktop_20250930_160739.html
```

**Get CrUX data with performance assessment and recommendations:**
```bash
$ python pagespeed_report.py --crux --url https://example.com --recommendations

🔍 Fetching CrUX History data for https://example.com...
   Device: PHONE
   Periods: 25 weeks

⏳ This may take a moment...
🔍 Fetching PageSpeed Insights recommendations...
📊 Generating visualizations...

✅ CrUX History report generated successfully!

📄 Files created:
  • JSON Data: reports/crux_history_20250930_160739.json
  • HTML Report: reports/crux_history_phone_20250930_160739.html

📈 Summary:
  • Metrics collected: 5
  • Time periods: 25 weeks
  • Performance assessment: Included
  • Recommendations: 8 opportunities, 3 diagnostics
```

**Process existing JSON file:**
```bash
$ python pagespeed_report.py --json reports/pagespeed_report_20250930_160739.json

📂 Processing existing JSON file: reports/pagespeed_report_20250930_160739.json

📊 Processing data for: https://example.com
📱 Generating mobile HTML report...
💻 Generating desktop HTML report...

✅ HTML reports generated successfully!
```

## Output

All reports are saved in the `./reports` directory (created automatically if it doesn't exist).

The script generates three files for each run:

1. **JSON file** (`reports/pagespeed_report_TIMESTAMP.json`)
   - Contains raw API response data for both mobile and desktop
   - Useful for further processing or integration with other tools

2. **Mobile HTML report** (`reports/pagespeed_report_mobile_TIMESTAMP.html`)
   - User-friendly visual report for mobile performance
   - Includes scores, metrics, and recommendations

3. **Desktop HTML report** (`reports/pagespeed_report_desktop_TIMESTAMP.html`)
   - User-friendly visual report for desktop performance
   - Includes scores, metrics, and recommendations

## What's Included in the Reports

### Standard PageSpeed Insights Reports
- **Performance Scores**: Performance, SEO, Accessibility, Best Practices
- **Core Web Vitals**: FCP, LCP, CLS, TTI, TBT metrics
- **Recommendations**: Detailed optimization suggestions

### Enhanced CrUX History Reports (NEW!)

#### 📊 Historical Performance Timeline
- Interactive charts showing Core Web Vitals trends over time
- Up to 40 weeks of real user data from Chrome UX Report
- Quality score visualization (0-100 scale) for easy interpretation

#### 🎯 Performance Assessment (NEW with --recommendations)
- **Overall Performance Score**: Calculated from latest CrUX data
- **Individual Metric Analysis**: Status for each Core Web Vital
- **Issues Identification**: Metrics that need attention (poor/needs improvement)
- **Strengths Recognition**: Well-performing metrics
- **Real User Data**: Based on P75 values from actual Chrome users

#### 🚀 PageSpeed Insights Recommendations (NEW with --recommendations)
- **Optimization Opportunities**: Specific improvements with potential savings
- **Diagnostic Recommendations**: Technical issues to address
- **Actionable Steps**: Clear guidance on how to improve performance
- **Prioritized Fixes**: Focus on high-impact optimizations

### Key Metrics Explained
- **First Contentful Paint (FCP)**: Time until first content appears
- **Largest Contentful Paint (LCP)**: Time until largest content element loads
- **Cumulative Layout Shift (CLS)**: Visual stability metric
- **Interaction to Next Paint (INP)**: Responsiveness to user interactions
- **Time to First Byte (TTFB)**: Server response time

## API Usage Limits

The PageSpeed Insights API has usage limits:
- **Free tier**: 25,000 queries per day
- **Rate limit**: 1 query per second per project

For more details, check the [PageSpeed Insights API documentation](https://developers.google.com/speed/docs/insights/v5/get-started).

## Notes

- For best results, test a **publicly accessible URL**
- The analysis may take 30-60 seconds per URL
- Make sure the URL is valid and accessible
- Private/localhost URLs won't work (they need to be publicly accessible)

## Troubleshooting

**Error: "Please set the PAGESPEED_INSIGHTS_API_KEY environment variable"**
- Make sure you've set the API key as described in the Setup section
- Verify the environment variable is set: `echo $PAGESPEED_INSIGHTS_API_KEY`

**Error: "Network error occurred"**
- Check your internet connection
- Verify the URL is correct and accessible
- Check if you've exceeded API rate limits

**Error: "Error parsing API response"**
- The URL may not be publicly accessible
- The API may have returned an error (check the error message)
- Verify your API key is valid and the API is enabled

## License

This project is open source and available for personal and commercial use.
