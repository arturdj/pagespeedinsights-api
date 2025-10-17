/**
 * CrUX Integration Module for Azion PageSpeed Analyzer
 * Handles Chrome User Experience Report data integration
 */

import axios from 'axios';

/**
 * Fetch CrUX History data with error handling
 * @param {string} apiKey - Google API key
 * @param {string} url - URL to analyze
 * @param {string} formFactor - Device type (PHONE, DESKTOP, TABLET)
 * @param {number} collectionPeriodCount - Number of collection periods (1-40)
 * @returns {Object} CrUX data or empty structure
 */
export async function getCruxHistory(apiKey, url, formFactor = 'PHONE', collectionPeriodCount = 25) {
    const endpoint = `https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=${apiKey}`;
    
    const metrics = [
        'largest_contentful_paint',
        'first_contentful_paint', 
        'cumulative_layout_shift',
        'interaction_to_next_paint',
        'experimental_time_to_first_byte'
    ];
    
    // Determine if URL is origin or specific page
    const isOrigin = url.split('/').length === 3 && !url.endsWith('/');
    
    const payload = {
        formFactor,
        metrics,
        collectionPeriodCount: Math.min(Math.max(collectionPeriodCount, 1), 40)
    };
    
    if (isOrigin) {
        payload.origin = url;
    } else {
        payload.url = url;
    }
    
    try {
        const response = await axios.post(endpoint, payload, { timeout: 30000 });
        const data = response.data;
        
        if (data.error) {
            console.log(`⚠️ CrUX data unavailable: ${data.error.message || 'Unknown error'}`);
            return createEmptyCruxData(url, formFactor);
        }
        
        return data;
        
    } catch (error) {
        console.log(`⚠️ CrUX API error: ${error.message}`);
        return createEmptyCruxData(url, formFactor);
    }
}

/**
 * Create empty CrUX data structure for fallback
 * @param {string} url - URL
 * @param {string} formFactor - Device type
 * @returns {Object} Empty CrUX data structure
 */
function createEmptyCruxData(url, formFactor) {
    return {
        record: {
            key: { url, formFactor },
            metrics: {},
            collectionPeriods: []
        },
        error: { message: 'CrUX data not available' }
    };
}

/**
 * Extract Core Web Vitals from PageSpeed Insights data
 * @param {Object} pagespeedData - PageSpeed Insights response
 * @returns {Object|null} Core Web Vitals data
 */
export function extractPagespeedCoreVitals(pagespeedData) {
    if (!pagespeedData || pagespeedData.error) {
        return null;
    }
    
    try {
        const audits = pagespeedData.lighthouseResult?.audits || {};
        const coreVitals = {};
        
        // Extract Core Web Vitals
        const auditMapping = {
            'largest-contentful-paint': 'largest_contentful_paint',
            'first-contentful-paint': 'first_contentful_paint',
            'cumulative-layout-shift': 'cumulative_layout_shift',
            'interaction-to-next-paint': 'interaction_to_next_paint',
            'server-response-time': 'experimental_time_to_first_byte'
        };
        
        for (const [auditId, metricName] of Object.entries(auditMapping)) {
            const audit = audits[auditId] || {};
            if (audit.numericValue !== null && audit.numericValue !== undefined) {
                coreVitals[metricName] = audit.numericValue;
            }
        }
        
        return Object.keys(coreVitals).length > 0 ? coreVitals : null;
        
    } catch (error) {
        console.log(`⚠️ Error extracting Core Web Vitals: ${error.message}`);
        return null;
    }
}

/**
 * Process CrUX data with PageSpeed integration
 * @param {Object} cruxData - CrUX API response
 * @param {Object} pagespeedCoreVitals - PageSpeed Core Web Vitals
 * @returns {Object|null} Processed CrUX data
 */
export function processCruxData(cruxData, pagespeedCoreVitals = null) {
    if (cruxData.error && !pagespeedCoreVitals) {
        return null;
    }
    
    const record = cruxData.record || {};
    const metrics = record.metrics || {};
    const collectionPeriods = record.collectionPeriods || [];
    
    // Extract dates
    const dates = [];
    for (const period of collectionPeriods) {
        const lastDate = period.lastDate || {};
        try {
            const year = lastDate.year;
            const month = String(lastDate.month || 1).padStart(2, '0');
            const day = String(lastDate.day || 1).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            dates.push(dateStr);
        } catch (error) {
            dates.push('N/A');
        }
    }
    
    // Add current date for PageSpeed data
    if (pagespeedCoreVitals) {
        const currentDate = new Date().toISOString().split('T')[0];
        dates.push(currentDate);
    }
    
    const processed = {
        dates,
        metrics: {},
        hasPagespeedData: Boolean(pagespeedCoreVitals),
        hasCruxData: Boolean(Object.keys(metrics).length > 0)
    };
    
    // Process CrUX metrics
    for (const [metricName, metricData] of Object.entries(metrics)) {
        const percentiles = metricData.percentilesTimeseries || {};
        let p75Values = percentiles.p75s || [];
        
        // Add PageSpeed data if available
        if (pagespeedCoreVitals && pagespeedCoreVitals[metricName]) {
            let pagespeedValue = pagespeedCoreVitals[metricName];
            // Adjust CLS format
            if (metricName === 'cumulative_layout_shift') {
                pagespeedValue = pagespeedValue / 100;
            }
            p75Values = [...p75Values, pagespeedValue];
        }
        
        processed.metrics[metricName] = {
            p75: p75Values,
            histogram: metricData.histogramTimeseries || []
        };
    }
    
    // Add PageSpeed-only metrics
    if (pagespeedCoreVitals) {
        for (const [metricName, value] of Object.entries(pagespeedCoreVitals)) {
            if (!processed.metrics[metricName]) {
                let adjustedValue = value;
                if (metricName === 'cumulative_layout_shift') {
                    adjustedValue = value / 100;
                }
                processed.metrics[metricName] = {
                    p75: [adjustedValue],
                    histogram: []
                };
            }
        }
    }
    
    return processed;
}

/**
 * Create Core Web Vitals timeline chart
 * @param {Object} processedData - Processed CrUX data
 * @param {string} url - Website URL
 * @returns {string} HTML chart or fallback message
 */
export function createCoreVitalsChart(processedData, url) {
    if (!processedData || !processedData.metrics || Object.keys(processedData.metrics).length === 0) {
        return "<p>No Core Web Vitals data available</p>";
    }
    
    const dates = processedData.dates;
    const metrics = processedData.metrics;
    const hasPagespeedData = processedData.hasPagespeedData || false;
    
    // Metric configurations
    const metricConfigs = {
        largest_contentful_paint: {
            name: 'LCP', color: '#4285F4', good: 2500, poor: 4000, unit: 'ms'
        },
        first_contentful_paint: {
            name: 'FCP', color: '#34A853', good: 1800, poor: 3000, unit: 'ms'
        },
        cumulative_layout_shift: {
            name: 'CLS', color: '#FBBC04', good: 0.1, poor: 0.25, unit: '', multiplier: 100
        },
        interaction_to_next_paint: {
            name: 'INP', color: '#EA4335', good: 200, poor: 500, unit: 'ms'
        },
        experimental_time_to_first_byte: {
            name: 'TTFB', color: '#9334E6', good: 800, poor: 1800, unit: 'ms'
        }
    };
    
    const traces = [];
    
    for (const [metricKey, metricData] of Object.entries(metrics)) {
        if (!metricConfigs[metricKey]) {
            continue;
        }
        
        const config = metricConfigs[metricKey];
        const p75Values = metricData.p75 || [];
        
        if (p75Values.length === 0) {
            continue;
        }
        
        // Apply multiplier for CLS
        const multiplier = config.multiplier || 1;
        const displayValues = p75Values.map(v => parseFloat(v) * multiplier);
        
        // Create marker styles
        const markerSizes = new Array(displayValues.length).fill(8);
        const markerColors = new Array(displayValues.length).fill(config.color);
        
        if (hasPagespeedData && displayValues.length > 0) {
            markerSizes[markerSizes.length - 1] = 15;
            markerColors[markerColors.length - 1] = '#F3652B';
        }
        
        traces.push({
            x: dates,
            y: displayValues,
            mode: 'lines+markers',
            name: config.name,
            line: { color: config.color, width: 3 },
            marker: { size: markerSizes, color: markerColors },
            hovertemplate: `<b>${config.name}</b><br>Date: %{x}<br>Value: %{y}${config.unit}<extra></extra>`
        });
    }
    
    let titleText = `Core Web Vitals Timeline - ${url}`;
    if (hasPagespeedData) {
        titleText += "<br><sub>🔴 Latest point shows real-time PageSpeed data</sub>";
    }
    
    const layout = {
        height: 500,
        title: {
            text: titleText,
            x: 0.5,
            font: { size: 18, color: '#F3652B' }
        },
        xaxis: { title: "Date" },
        yaxis: { title: "Performance Metrics" },
        plot_bgcolor: '#1A1A1A',
        paper_bgcolor: '#0D0D0D',
        font: { color: '#FFFFFF' },
        legend: {
            orientation: "h",
            yanchor: "top",
            y: -0.15,
            xanchor: "center",
            x: 0.5
        },
        margin: { t: 100, b: 80, l: 50, r: 50 },
        shapes: [
            // LCP Good threshold
            {
                type: 'line',
                x0: 0, x1: 1, xref: 'paper',
                y0: 2500, y1: 2500,
                line: { color: 'green', width: 2, dash: 'dash' }
            },
            // LCP Poor threshold
            {
                type: 'line',
                x0: 0, x1: 1, xref: 'paper',
                y0: 4000, y1: 4000,
                line: { color: 'red', width: 2, dash: 'dash' }
            }
        ],
        annotations: [
            {
                x: 1, xref: 'paper', xanchor: 'right',
                y: 2500, yref: 'y',
                text: 'LCP Good',
                showarrow: false,
                font: { color: 'green', size: 12 }
            },
            {
                x: 1, xref: 'paper', xanchor: 'right',
                y: 4000, yref: 'y',
                text: 'LCP Poor',
                showarrow: false,
                font: { color: 'red', size: 12 }
            }
        ]
    };
    
    const config = {
        displayModeBar: false,
        responsive: true
    };
    
    // Generate the chart HTML
    const chartDiv = 'core_vitals_chart';
    const plotlyScript = `
        <div id="${chartDiv}"></div>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <script>
            Plotly.newPlot('${chartDiv}', ${JSON.stringify(traces)}, ${JSON.stringify(layout)}, ${JSON.stringify(config)});
        </script>
    `;
    
    return plotlyScript;
}

/**
 * Assess performance based on CrUX data
 * @param {Object} processedData - Processed CrUX data
 * @returns {Object|null} Performance assessment
 */
export function assessCruxPerformance(processedData) {
    if (!processedData || !processedData.metrics || Object.keys(processedData.metrics).length === 0) {
        return null;
    }
    
    const metrics = processedData.metrics;
    const thresholds = {
        largest_contentful_paint: { good: 2500, poor: 4000 },
        first_contentful_paint: { good: 1800, poor: 3000 },
        cumulative_layout_shift: { good: 0.1, poor: 0.25 },
        interaction_to_next_paint: { good: 200, poor: 500 },
        experimental_time_to_first_byte: { good: 800, poor: 1800 }
    };
    
    const assessment = {
        overallScore: 0,
        metricsAssessment: {},
        issues: [],
        strengths: []
    };
    
    let totalScore = 0;
    let metricCount = 0;
    
    for (const [metricName, metricData] of Object.entries(metrics)) {
        if (!thresholds[metricName]) {
            continue;
        }
        
        const p75Values = metricData.p75 || [];
        if (p75Values.length === 0) {
            continue;
        }
        
        try {
            let latestValue = parseFloat(p75Values[p75Values.length - 1]);
            if (metricName === 'cumulative_layout_shift') {
                latestValue *= 100;
            }
        } catch (error) {
            continue;
        }
        
        const threshold = thresholds[metricName];
        let latestValue = parseFloat(p75Values[p75Values.length - 1]);
        if (metricName === 'cumulative_layout_shift') {
            latestValue *= 100;
        }
        
        // Determine performance level
        let status, score;
        if (latestValue <= threshold.good) {
            status = 'good';
            score = 100;
        } else if (latestValue <= threshold.poor) {
            status = 'needs_improvement';
            const rangeSize = threshold.poor - threshold.good;
            const position = (latestValue - threshold.good) / rangeSize;
            score = 75 - (position * 50);
        } else {
            status = 'poor';
            score = Math.max(0, 25 - (latestValue - threshold.poor) / threshold.poor * 25);
        }
        
        const displayNames = {
            largest_contentful_paint: 'Largest Contentful Paint (LCP)',
            first_contentful_paint: 'First Contentful Paint (FCP)',
            cumulative_layout_shift: 'Cumulative Layout Shift (CLS)',
            interaction_to_next_paint: 'Interaction to Next Paint (INP)',
            experimental_time_to_first_byte: 'Time to First Byte (TTFB)'
        };
        
        const metricInfo = {
            name: metricName,
            displayName: displayNames[metricName] || metricName,
            value: latestValue,
            unit: metricName !== 'cumulative_layout_shift' ? 'ms' : '',
            status,
            score,
            thresholdGood: threshold.good,
            thresholdPoor: threshold.poor
        };
        
        assessment.metricsAssessment[metricName] = metricInfo;
        totalScore += score;
        metricCount += 1;
        
        if (status === 'poor') {
            assessment.issues.push({
                metric: metricInfo.displayName,
                value: latestValue,
                threshold: threshold.good,
                severity: 'high'
            });
        } else if (status === 'needs_improvement') {
            assessment.issues.push({
                metric: metricInfo.displayName,
                value: latestValue,
                threshold: threshold.good,
                severity: 'medium'
            });
        } else {
            assessment.strengths.push(metricInfo.displayName);
        }
    }
    
    if (metricCount > 0) {
        assessment.overallScore = totalScore / metricCount;
    }
    
    return assessment;
}
