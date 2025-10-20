import { PageSpeedInsightsResponse, AnalysisResult, IssueInfo, ConsoleError } from '../types/index.js';

const API_TIMEOUT = 120000; // 120 seconds

export class PageSpeedService {
  
  async getPageSpeedInsights(
    apiKey: string, 
    url: string, 
    strategy: 'mobile' | 'desktop' = 'mobile'
  ): Promise<PageSpeedInsightsResponse> {
    const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const params = new URLSearchParams({
      url,
      key: apiKey,
      strategy: strategy.toUpperCase()
    });
    
    // Add categories as separate parameters
    const categories = ['PERFORMANCE', 'SEO', 'ACCESSIBILITY', 'BEST_PRACTICES'];
    categories.forEach(category => {
      params.append('category', category);
    });

    console.log(`🔍 PageSpeed API call: ${endpoint}?${params.toString().replace(/key=[^&]+/, 'key=***')}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${endpoint}?${params}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetails = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorDetails += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore error reading response body
        }
        throw new Error(errorDetails);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        return { 
          lighthouseResult: { audits: {}, categories: {} },
          error: { message: `API error: ${error.message}` }
        };
      }
      return { 
        lighthouseResult: { audits: {}, categories: {} },
        error: { message: 'Unknown API error' }
      };
    }
  }

  analyzePageSpeedData(pagespeedData: PageSpeedInsightsResponse): AnalysisResult | null {
    if (pagespeedData.error) {
      return null;
    }

    try {
      const lighthouseResult = pagespeedData.lighthouseResult;
      const audits = lighthouseResult.audits || {};
      const categories = lighthouseResult.categories || {};

      const analysis: AnalysisResult = {
        performance: { score: (categories.performance?.score || 0) * 100, issues: [] },
        accessibility: { score: (categories.accessibility?.score || 0) * 100, issues: [] },
        best_practices: { score: (categories['best_practices']?.score || 0) * 100, issues: [] },
        seo: { score: (categories.seo?.score || 0) * 100, issues: [] }
      };

      // Process audits and map to categories
      for (const [auditId, audit] of Object.entries(audits)) {
        const score = audit.score;
        if (score === null || score >= 0.9) {
          continue;
        }

        const auditInfo: IssueInfo = {
          id: auditId,
          title: audit.title || '',
          description: audit.description || '',
          score,
          display_value: audit.displayValue || '',
          impact: score < 0.5 ? 'high' : 'medium',
          original_pagespeed_data: {
            description: audit.description || '',
            explanation: audit.explanation || '',
            score_display_mode: audit.scoreDisplayMode || '',
            numeric_value: audit.numericValue,
            numeric_unit: audit.numericUnit || '',
            details: audit.details || {},
            warnings: audit.warnings || []
          }
        };

        // Extract console error details for errors-in-console audit
        if (auditId === 'errors-in-console') {
          const consoleErrors: ConsoleError[] = [];
          const details = audit.details as any;
          const items = details?.items || [];

          for (const item of items) {
            const errorInfo: ConsoleError = {
              description: item.description || '',
              source: item.source || '',
              source_location: item.sourceLocation || {}
            };
            consoleErrors.push(errorInfo);
          }

          auditInfo.console_errors = consoleErrors;
          auditInfo.console_error_count = consoleErrors.length;
        }

        // Comprehensive audit categorization
        const performanceAudits = [
          'first-contentful-paint', 'largest-contentful-paint', 'speed-index', 'interactive',
          'total-blocking-time', 'cumulative-layout-shift', 'server-response-time',
          'render-blocking-resources', 'unused-css-rules', 'unused-javascript',
          'modern-image-formats', 'uses-webp-images', 'uses-optimized-images',
          'efficient-animated-content', 'legacy-javascript', 'preload-lcp-image',
          'uses-rel-preconnect', 'uses-rel-preload', 'font-display', 'third-party-summary',
          'bootup-time', 'mainthread-work-breakdown', 'dom-size', 'critical-request-chains',
          'user-timings', 'uses-passive-event-listeners', 'no-document-write',
          'uses-http2', 'uses-long-cache-ttl', 'total-byte-weight', 'offscreen-images',
          'unminified-css', 'unminified-javascript', 'unused-css-rules', 'uses-text-compression',
          'redirects', 'uses-responsive-images', 'first-input-delay', 'interaction-to-next-paint'
        ];

        const accessibilityAudits = [
          'color-contrast', 'image-alt', 'label', 'link-name', 'button-name', 'form-field-multiple-labels',
          'frame-title', 'duplicate-id-active', 'duplicate-id-aria', 'heading-order',
          'html-has-lang', 'html-lang-valid', 'input-image-alt', 'installable-manifest',
          'is-crawlable', 'lang', 'logical-tab-order', 'managed-focus', 'meta-refresh',
          'meta-viewport', 'object-alt', 'tabindex', 'td-headers-attr', 'th-has-data-cells',
          'valid-lang', 'video-caption', 'video-description', 'focus-traps', 'focusable-controls',
          'interactive-element-affordance', 'use-landmarks', 'aria-allowed-attr', 'aria-command-name',
          'aria-hidden-body', 'aria-hidden-focus', 'aria-input-field-name', 'aria-meter-name',
          'aria-progressbar-name', 'aria-required-attr', 'aria-required-children', 'aria-required-parent',
          'aria-roles', 'aria-toggle-field-name', 'aria-tooltip-name', 'aria-treeitem-name',
          'aria-valid-attr-value', 'aria-valid-attr', 'bypass', 'definition-list', 'dlitem',
          'document-title', 'list', 'listitem', 'skip-link'
        ];

        const bestPracticesAudits = [
          'is-on-https', 'no-vulnerable-libraries', 'external-anchors-use-rel-noopener',
          'geolocation-on-start', 'notification-on-start', 'password-inputs-can-be-pasted-into',
          'uses-http2', 'uses-passive-event-listeners', 'no-document-write', 'has-doctype',
          'charset', 'dom-size', 'external-anchors-use-rel-noopener', 'js-libraries',
          'deprecations', 'third-party-cookies', 'inspector-issues', 'csp-xss',
          'unused-javascript', 'modern-image-formats', 'appcache-manifest', 'doctype',
          'no-vulnerable-libraries', 'image-aspect-ratio', 'image-size-responsive',
          'preload-fonts', 'font-display', 'errors-in-console'
        ];

        const seoAudits = [
          'viewport', 'document-title', 'meta-description', 'crawlable-anchors', 'is-crawlable',
          'robots-txt', 'hreflang', 'canonical', 'structured-data', 'html-has-lang',
          'html-lang-valid', 'http-status-code', 'link-text', 'plugins', 'tap-targets',
          'font-size', 'legible-font-sizes', 'image-alt', 'video-caption'
        ];

        // Categorize audit
        if (performanceAudits.includes(auditId)) {
          analysis.performance.issues.push(auditInfo);
        } else if (accessibilityAudits.includes(auditId)) {
          analysis.accessibility.issues.push(auditInfo);
        } else if (bestPracticesAudits.includes(auditId)) {
          analysis.best_practices.issues.push(auditInfo);
        } else if (seoAudits.includes(auditId)) {
          analysis.seo.issues.push(auditInfo);
        } else {
          // Default to performance if not categorized
          analysis.performance.issues.push(auditInfo);
        }
      }

      return analysis;

    } catch (error) {
      console.error('Error analyzing PageSpeed data:', error);
      return null;
    }
  }
}
