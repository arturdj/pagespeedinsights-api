import { CrUXData, ProcessedCrUXData, CoreWebVitals, PageSpeedInsightsResponse } from '../types';

export class CrUXService {
  
  async getCrUXHistory(
    apiKey: string,
    url: string,
    formFactor: 'PHONE' | 'DESKTOP' | 'TABLET' = 'PHONE',
    collectionPeriodCount: number = 25
  ): Promise<CrUXData> {
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

    const payload: any = {
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
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.error) {
        console.warn(`CrUX data unavailable: ${data.error.message || 'Unknown error'}`);
        return this.createEmptyCrUXData(url, formFactor);
      }

      return data;

    } catch (error) {
      console.warn(`CrUX API error: ${error}`);
      return this.createEmptyCrUXData(url, formFactor);
    }
  }

  private createEmptyCrUXData(url: string, formFactor: string): CrUXData {
    return {
      record: {
        key: { url, formFactor },
        metrics: {},
        collectionPeriods: []
      },
      error: { message: 'CrUX data not available' }
    };
  }

  extractPageSpeedCoreVitals(pagespeedData: PageSpeedInsightsResponse): CoreWebVitals | null {
    if (!pagespeedData || pagespeedData.error) {
      return null;
    }

    try {
      const audits = pagespeedData.lighthouseResult?.audits || {};
      const coreVitals: CoreWebVitals = {};

      const auditMapping: Record<string, keyof CoreWebVitals> = {
        'largest-contentful-paint': 'largest_contentful_paint',
        'first-contentful-paint': 'first_contentful_paint',
        'cumulative-layout-shift': 'cumulative_layout_shift',
        'interaction-to-next-paint': 'interaction_to_next_paint',
        'server-response-time': 'experimental_time_to_first_byte'
      };

      for (const [auditId, metricName] of Object.entries(auditMapping)) {
        const audit = audits[auditId];
        if (audit?.numericValue !== undefined && audit.numericValue !== null) {
          coreVitals[metricName] = audit.numericValue;
        }
      }

      return Object.keys(coreVitals).length > 0 ? coreVitals : null;

    } catch (error) {
      console.warn(`Error extracting Core Web Vitals: ${error}`);
      return null;
    }
  }

  processCrUXData(cruxData: CrUXData, pagespeedCoreVitals?: CoreWebVitals | null): ProcessedCrUXData | null {
    if (cruxData.error && !pagespeedCoreVitals) {
      return null;
    }

    const record = cruxData.record || {};
    const metrics = record.metrics || {};
    const collectionPeriods = record.collectionPeriods || [];

    // Extract dates
    const dates: string[] = [];
    for (const period of collectionPeriods) {
      const lastDate = period.lastDate;
      try {
        const dateStr = `${lastDate.year}-${String(lastDate.month || 1).padStart(2, '0')}-${String(lastDate.day || 1).padStart(2, '0')}`;
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

    const processed: ProcessedCrUXData = {
      dates,
      metrics: {},
      has_pagespeed_data: Boolean(pagespeedCoreVitals),
      has_crux_data: Boolean(Object.keys(metrics).length > 0)
    };

    // Process CrUX metrics
    for (const [metricName, metricData] of Object.entries(metrics)) {
      const percentiles = metricData.percentilesTimeseries || {};
      let p75Values = percentiles.p75s || [];

      // Add PageSpeed data if available
      if (pagespeedCoreVitals && metricName in pagespeedCoreVitals) {
        let pagespeedValue = pagespeedCoreVitals[metricName as keyof CoreWebVitals];
        if (pagespeedValue !== undefined) {
          // Adjust CLS format
          if (metricName === 'cumulative_layout_shift') {
            pagespeedValue = pagespeedValue / 100;
          }
          p75Values = [...p75Values, pagespeedValue];
        }
      }

      processed.metrics[metricName] = {
        p75: p75Values,
        histogram: metricData.histogramTimeseries || []
      };
    }

    // Add PageSpeed-only metrics
    if (pagespeedCoreVitals) {
      for (const [metricName, value] of Object.entries(pagespeedCoreVitals)) {
        if (!(metricName in processed.metrics) && value !== undefined) {
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

  createCoreVitalsChart(processedData: ProcessedCrUXData, url: string): string {
    if (!processedData || !processedData.metrics || Object.keys(processedData.metrics).length === 0) {
      return '<p>No Core Web Vitals data available</p>';
    }

    const dates = processedData.dates;
    const metrics = processedData.metrics;
    const hasPagespeedData = processedData.has_pagespeed_data;

    // Metric configurations
    const metricConfigs: Record<string, {
      name: string;
      color: string;
      good: number;
      poor: number;
      unit: string;
      multiplier?: number;
    }> = {
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

    // Generate chart data
    const traces: any[] = [];
    
    for (const [metricKey, metricData] of Object.entries(metrics)) {
      if (!(metricKey in metricConfigs)) {
        continue;
      }

      const config = metricConfigs[metricKey];
      const p75Values = metricData.p75 || [];

      if (p75Values.length === 0) {
        continue;
      }

      // Apply multiplier for CLS
      const multiplier = config.multiplier || 1;
      const displayValues = p75Values.map(v => parseFloat(String(v)) * multiplier);

      traces.push({
        x: dates.slice(0, displayValues.length),
        y: displayValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: config.name,
        line: { color: config.color, width: 3 },
        marker: {
          size: displayValues.map((_, i) => 
            hasPagespeedData && i === displayValues.length - 1 ? 15 : 8
          ),
          color: displayValues.map((_, i) => 
            hasPagespeedData && i === displayValues.length - 1 ? '#F3652B' : config.color
          )
        }
      });
    }

    const titleText = hasPagespeedData 
      ? `Core Web Vitals Timeline - ${url}<br><sub style="color: #F3652B;">🔴 Latest point shows real-time PageSpeed data</sub>`
      : `Core Web Vitals Timeline - ${url}`;

    // Create Plotly chart HTML
    const chartHtml = `
      <div id="core_vitals_chart" style="width: 100%; height: 500px;"></div>
      <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
      <script>
        const data = ${JSON.stringify(traces)};
        const layout = {
          height: 500,
          title: {
            text: '${titleText}',
            x: 0.5,
            font: { size: 18, color: '#F3652B' }
          },
          xaxis: { title: 'Date' },
          yaxis: { title: 'Performance Metrics' },
          plot_bgcolor: '#1A1A1A',
          paper_bgcolor: '#0D0D0D',
          font: { color: '#FFFFFF' },
          legend: {
            orientation: 'h',
            yanchor: 'top',
            y: -0.15,
            xanchor: 'center',
            x: 0.5
          },
          margin: { t: 100, b: 80, l: 50, r: 50 },
          shapes: [
            {
              type: 'line',
              x0: 0, x1: 1, xref: 'paper',
              y0: 2500, y1: 2500,
              line: { color: 'green', width: 2, dash: 'dash' }
            },
            {
              type: 'line',
              x0: 0, x1: 1, xref: 'paper',
              y0: 4000, y1: 4000,
              line: { color: 'red', width: 2, dash: 'dash' }
            }
          ],
          annotations: [
            {
              x: 0.02, y: 2500, xref: 'paper', yref: 'y',
              text: 'LCP Good', showarrow: false,
              font: { color: 'green', size: 12 }
            },
            {
              x: 0.02, y: 4000, xref: 'paper', yref: 'y',
              text: 'LCP Poor', showarrow: false,
              font: { color: 'red', size: 12 }
            }
          ]
        };
        Plotly.newPlot('core_vitals_chart', data, layout);
      </script>
    `;

    return chartHtml;
  }

  assessCrUXPerformance(processedData: ProcessedCrUXData): any | null {
    if (!processedData || !processedData.metrics || Object.keys(processedData.metrics).length === 0) {
      return null;
    }

    const metrics = processedData.metrics;
    const thresholds: Record<string, { good: number; poor: number }> = {
      largest_contentful_paint: { good: 2500, poor: 4000 },
      first_contentful_paint: { good: 1800, poor: 3000 },
      cumulative_layout_shift: { good: 0.1, poor: 0.25 },
      interaction_to_next_paint: { good: 200, poor: 500 },
      experimental_time_to_first_byte: { good: 800, poor: 1800 }
    };

    const assessment = {
      overall_score: 0,
      metrics_assessment: {} as Record<string, any>,
      issues: [] as any[],
      strengths: [] as string[]
    };

    let totalScore = 0;
    let metricCount = 0;

    for (const [metricName, metricData] of Object.entries(metrics)) {
      if (!(metricName in thresholds)) {
        continue;
      }

      const p75Values = metricData.p75 || [];
      if (p75Values.length === 0) {
        continue;
      }

      try {
        let latestValue = parseFloat(String(p75Values[p75Values.length - 1]));
        if (metricName === 'cumulative_layout_shift') {
          latestValue *= 100;
        }

        const threshold = thresholds[metricName];
        let status: string;
        let score: number;

        // Determine performance level
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

        const displayNames: Record<string, string> = {
          largest_contentful_paint: 'Largest Contentful Paint (LCP)',
          first_contentful_paint: 'First Contentful Paint (FCP)',
          cumulative_layout_shift: 'Cumulative Layout Shift (CLS)',
          interaction_to_next_paint: 'Interaction to Next Paint (INP)',
          experimental_time_to_first_byte: 'Time to First Byte (TTFB)'
        };

        const metricInfo = {
          name: metricName,
          display_name: displayNames[metricName] || metricName,
          value: latestValue,
          unit: metricName !== 'cumulative_layout_shift' ? 'ms' : '',
          status,
          score,
          threshold_good: threshold.good,
          threshold_poor: threshold.poor
        };

        assessment.metrics_assessment[metricName] = metricInfo;
        totalScore += score;
        metricCount += 1;

        if (status === 'poor') {
          assessment.issues.push({
            metric: metricInfo.display_name,
            value: latestValue,
            threshold: threshold.good,
            severity: 'high'
          });
        } else if (status === 'needs_improvement') {
          assessment.issues.push({
            metric: metricInfo.display_name,
            value: latestValue,
            threshold: threshold.good,
            severity: 'medium'
          });
        } else {
          assessment.strengths.push(metricInfo.display_name);
        }

      } catch (error) {
        continue;
      }
    }

    if (metricCount > 0) {
      assessment.overall_score = totalScore / metricCount;
    }

    return assessment;
  }
}
