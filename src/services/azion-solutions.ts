import { AzionSolution, AzionRecommendation, AzionRecommendations, MarketingData, AnalysisResult, IssueInfo, ActionPlan } from '../types/index.js';

// Comprehensive Azion Platform Solutions Mapping
const AZION_SOLUTIONS: Record<string, AzionSolution> = {
  applications: {
    id: 'applications',
    name: 'Applications',
    description: 'Build and deploy applications that run directly on Azion\'s distributed network',
    features: [
      'Edge computing platform for web applications and APIs',
      'HTTP/2 and HTTP/3 support for multiplexed connections',
      'SSL/TLS termination and certificate management',
      'Custom domain support with automatic HTTPS',
      'Rules Engine for conditional business logic',
      'Device Groups for adaptive delivery',
      'Cache policies and TTL management',
      'Origin failover and health checks',
      'Real-time metrics and monitoring',
      'WebSocket support for real-time applications',
      'Automatic GZIP/Brotli compression for text-based content',
      'Streaming compression for large payloads',
      'Content-Type aware compression algorithms'
    ],
    benefits: [
      'Reduced latency through edge delivery',
      'Improved Core Web Vitals scores',
      'Enhanced user experience',
      'Reduced origin server load',
      'Automatic bandwidth savings through compression',
      'Faster page load times with compressed content'
    ],
    url: 'https://www.azion.com/en/products/applications/'
  },
  functions: {
    id: 'functions',
    name: 'Functions',
    description: 'Create event-driven, serverless applications at the edge of the network',
    features: [
      'JavaScript runtime with Node.js compatibility',
      'WebAssembly (WASM) support for high-performance execution',
      'AI Framework support with LangGraph and LangChain integrations',
      'Edge SQL integration for database operations',
      'WebSocket Proxy for real-time bidirectional communication',
      '5-minute CPU time limit with 20MB bundle support',
      'Environment variables and JSON Args support',
      'High-resolution timer for performance measurement',
      'Cache API for edge cache control',
      'ES Module support',
      'WinterTC API compatibility'
    ],
    benefits: [
      'Request/response manipulation',
      'Dynamic content generation',
      'Authentication and authorization',
      'A/B testing and feature flags',
      'Bot detection and mitigation',
      'Geolocation-based routing',
      'API composition and transformation'
    ],
    url: 'https://www.azion.com/en/products/functions/'
  },
  cache: {
    id: 'cache',
    name: 'Cache',
    description: 'Advanced caching system that reduces latency and improves performance',
    features: [
      'Intelligent cache policies with customizable TTL',
      'Advanced Cache Key with query string and cookie support',
      'Large File Optimization with 1024kB fragments',
      'Stale cache serving during origin failures',
      'HTTP method caching (POST, OPTIONS)',
      'Adaptive Delivery for device-specific content',
      'Cache purging and invalidation',
      'Browser cache control',
      'Bypass cache for dynamic content',
      'Cache status monitoring (HIT/MISS)',
      'Compressed content caching with automatic decompression',
      'Content-Encoding aware cache policies'
    ],
    benefits: [
      'Reduces server response time (TTFB)',
      'Improves loading performance',
      'Reduces bandwidth costs',
      'Handles traffic spikes',
      'Caches compressed content for faster delivery',
      'Reduces origin bandwidth through compression'
    ],
    url: 'https://www.azion.com/en/products/cache/'
  },
  tiered_cache: {
    id: 'tiered_cache',
    name: 'Tiered Cache',
    description: 'Multi-layer caching architecture for enhanced performance and reduced origin load',
    features: [
      'Two-tier caching system (Edge + Regional)',
      'Reduced origin bandwidth consumption',
      'Improved cache hit ratios',
      'Automatic tier promotion based on popularity',
      'Configurable per cache setting',
      'Minimum 3-second TTL requirement',
      'Regional cache layer optimization'
    ],
    benefits: [
      'Reduces origin requests',
      'Improves cache hit ratio',
      'Faster content delivery',
      'Better scalability'
    ],
    url: 'https://www.azion.com/en/products/tiered-cache/'
  },
  image_processor: {
    id: 'image_processor',
    name: 'Image Processor',
    description: 'Automatic image optimization and transformation service',
    features: [
      'Automatic WebP/AVIF conversion based on browser support',
      'Real-time image resizing and cropping',
      'Quality optimization with compression',
      'Format conversion (JPEG, PNG, WebP, AVIF)',
      'Responsive image delivery',
      'Lazy loading optimization',
      'Animated GIF to video conversion',
      'Smart cropping with focal point detection',
      'Watermark application',
      'WASM-based image processing for advanced operations'
    ],
    benefits: [
      'Reduces image file sizes',
      'Serves next-gen formats',
      'Improves loading performance',
      'Saves bandwidth'
    ],
    url: 'https://www.azion.com/en/products/image-processor/'
  },
  firewall: {
    id: 'firewall',
    name: 'Firewall',
    description: 'Comprehensive security solution protecting applications from various threats',
    features: [
      'Web Application Firewall (WAF) with OWASP Top 10 protection',
      'DDoS Protection with automatic mitigation',
      'Bot Manager with advanced fingerprinting',
      'Rate Limiting and request throttling',
      'IP reputation and geoblocking',
      'Custom security rules with Rules Engine',
      'SSL/TLS encryption and certificate management',
      'Network Layer Protection (Layer 3/4)',
      'Real-time threat intelligence',
      'Security analytics and reporting'
    ],
    benefits: [
      'Blocks malicious requests',
      'Improves security posture',
      'Reduces server load',
      'Prevents attacks'
    ],
    url: 'https://www.azion.com/en/products/firewall/'
  },
  load_balancer: {
    id: 'load_balancer',
    name: 'Load Balancer',
    description: 'Intelligent traffic distribution across multiple origins',
    features: [
      'Multiple balancing algorithms (Round-Robin, Least Connections, IP Hash)',
      'Health checks and automatic failover',
      'Weighted traffic distribution (1-10 scale)',
      'Primary/Backup server roles',
      'SSL termination and certificate management',
      'Session persistence and sticky sessions',
      'Geographic load balancing',
      'Real-time origin monitoring',
      'Automatic scaling based on demand',
      'Up to 10 origin addresses per configuration'
    ],
    benefits: [
      'Improves availability',
      'Distributes traffic efficiently',
      'Reduces response times',
      'Handles failures gracefully'
    ],
    url: 'https://www.azion.com/en/products/load-balancer/'
  },
  best_practices_review: {
    id: 'best_practices_review',
    name: 'Best Practices Review',
    description: 'Thorough evaluation of infrastructure with expert recommendations to optimize performance, security, and efficiency',
    features: [
      'In-depth analysis of workload and infrastructure',
      'Application performance and security assessment',
      'Security measures evaluation and recommendations',
      'Cost optimization analysis and strategies',
      'Source code review and optimization recommendations',
      'Unused code identification and removal guidance',
      'Best practices implementation roadmap',
      'Industry-leading standards compliance review',
      'Expert consultation with Azion specialists',
      'Yearly hours included with Enterprise and Mission Critical plans'
    ],
    benefits: [
      'Improved application performance and security',
      'Cost optimization through expert analysis',
      'Source code optimization recommendations',
      'Unused resource identification and cleanup',
      'Industry best practices implementation',
      'Expert guidance for complex optimizations'
    ],
    url: 'https://www.azion.com/en/documentation/services/best-practices-review/'
  }
};

// Mapping PageSpeed Insights audit IDs to Azion solutions
const PAGESPEED_TO_AZION_MAPPING: Record<string, {
  solutions: string[];
  priority: 'high' | 'medium' | 'low';
  description: string;
}> = {
  'server-response-time': {
    solutions: ['cache', 'tiered_cache', 'load_balancer', 'functions'],
    priority: 'high',
    description: 'Dramatically improve server response times with multi-layer caching, load balancing, and edge processing'
  },
  'render-blocking-resources': {
    solutions: ['functions', 'applications', 'cache'],
    priority: 'high',
    description: 'Use Edge Functions to inline critical CSS/JS, modify resource loading order, and implement advanced optimization techniques'
  },
  'unused-css-rules': {
    solutions: ['best_practices_review'],
    priority: 'medium',
    description: 'Azion\'s Best Practices Review service provides expert analysis to identify and remove unused CSS rules from your source code, along with recommendations for CSS optimization and build process improvements'
  },
  'unused-javascript': {
    solutions: ['best_practices_review'],
    priority: 'medium',
    description: 'Azion\'s Best Practices Review service provides expert analysis to identify and remove unused JavaScript code from your source code, along with recommendations for tree-shaking, code splitting, and build optimization strategies'
  },
  'modern-image-formats': {
    solutions: ['image_processor', 'functions'],
    priority: 'high',
    description: 'Automatically convert images to WebP/AVIF formats with intelligent browser detection and quality optimization'
  },
  'uses-webp-images': {
    solutions: ['image_processor', 'cache'],
    priority: 'high',
    description: 'Serve WebP images automatically based on browser support with intelligent caching strategies'
  },
  'uses-optimized-images': {
    solutions: ['image_processor', 'cache', 'functions'],
    priority: 'high',
    description: 'Comprehensive image optimization including compression, resizing, format conversion, and smart caching'
  },
  'uses-text-compression': {
    solutions: ['applications', 'cache'],
    priority: 'high',
    description: 'Enable automatic GZIP/Brotli compression for all text-based content (HTML, CSS, JS, JSON, XML) with intelligent algorithm selection based on content type and client support. Azion Applications provide built-in compression with intelligent caching strategies.'
  },
  'uses-long-cache-ttl': {
    solutions: ['cache', 'tiered_cache', 'applications'],
    priority: 'high',
    description: 'Configure optimal cache TTL values with intelligent cache policies and multi-layer caching architecture'
  },
  'is-on-https': {
    solutions: ['applications', 'load_balancer'],
    priority: 'high',
    description: 'Enforce HTTPS connections with automatic certificate management, SSL/TLS termination, and security headers'
  },
  'no-vulnerable-libraries': {
    solutions: ['firewall', 'functions', 'applications'],
    priority: 'high',
    description: 'Block requests targeting vulnerable libraries, implement security scanning, and update dependencies automatically'
  },
  'csp-xss': {
    solutions: ['firewall', 'functions', 'applications'],
    priority: 'high',
    description: 'Implement Content Security Policy headers, XSS protection, and comprehensive security rule enforcement'
  },
  'largest-contentful-paint': {
    solutions: ['cache', 'image_processor', 'functions', 'tiered_cache'],
    priority: 'high',
    description: 'Optimize LCP through intelligent caching, image optimization, and critical resource prioritization'
  },
  'cumulative-layout-shift': {
    solutions: ['best_practices_review'],
    priority: 'high',
    description: 'Azion\'s Best Practices Review service provides expert guidance for preventing Cumulative Layout Shift through source code improvements, including proper image and video sizing, font loading optimization, and dynamic content insertion best practices'
  },
  'errors-in-console': {
    solutions: ['functions', 'applications', 'firewall'],
    priority: 'high',
    description: 'Fix JavaScript errors and console warnings through edge-side error handling and monitoring'
  },
  'image-alt': {
    solutions: ['best_practices_review'],
    priority: 'high',
    description: 'Azion\'s Best Practices Review service provides expert guidance for adding proper alt attributes to images in your source code, including accessibility best practices, SEO optimization, and automated testing strategies for image accessibility compliance'
  }
};

export class AzionSolutionsService {
  
  getAzionSolutionsForAudit(auditId: string, auditData?: IssueInfo): AzionRecommendation | null {
    if (!(auditId in PAGESPEED_TO_AZION_MAPPING)) {
      return null;
    }

    const mapping = PAGESPEED_TO_AZION_MAPPING[auditId];
    const solutions: AzionSolution[] = [];

    for (const solutionId of mapping.solutions) {
      if (solutionId in AZION_SOLUTIONS) {
        solutions.push(AZION_SOLUTIONS[solutionId]);
      }
    }

    return {
      audit_id: auditId,
      priority: mapping.priority,
      description: mapping.description,
      solutions,
      audit_data: auditData
    };
  }

  generateAzionRecommendations(analysis: AnalysisResult): AzionRecommendations {
    if (!analysis) {
      return { recommendations: [], marketing_data: this.createEmptyMarketingData(), solution_count: 0 };
    }

    const recommendations: AzionRecommendations['recommendations'] = [];
    const allSolutions = new Set<string>();

    for (const [categoryName, categoryData] of Object.entries(analysis)) {
      for (const issue of categoryData.issues) {
        const azionSolution = this.getAzionSolutionsForAudit(issue.id, issue);
        if (azionSolution) {
          recommendations.push({
            category: categoryName,
            issue,
            azion_solution: azionSolution
          });
          for (const solution of azionSolution.solutions) {
            allSolutions.add(solution.id);
          }
        }
      }
    }

    const marketingData = this.generateMarketingCampaignData(analysis);

    return {
      recommendations,
      marketing_data: marketingData,
      solution_count: allSolutions.size
    };
  }

  private generateMarketingCampaignData(pagespeedAnalysis: AnalysisResult): MarketingData {
    const campaignData: MarketingData = {
      summary: {
        total_issues: 0,
        high_priority_issues: 0,
        medium_priority_issues: 0,
        low_priority_issues: 0,
        potential_solutions: [],
        estimated_impact: 'high',
        console_errors: {
          has_console_errors: false,
          total_console_errors: 0,
          error_types: []
        }
      },
      categories: {},
      solutions_overview: {},
      action_plan: []
    };

    const potentialSolutions = new Set<string>();

    // Process each category
    for (const [categoryName, categoryData] of Object.entries(pagespeedAnalysis)) {
      if (!categoryData || typeof categoryData !== 'object' || !('score' in categoryData)) {
        continue;
      }

      const categoryIssues: any[] = [];

      // Process issues in the category
      if ('issues' in categoryData && Array.isArray(categoryData.issues)) {
        for (const audit of categoryData.issues) {
          const auditId = audit.id;
          if (auditId) {
            const azionSolution = this.getAzionSolutionsForAudit(auditId, audit);
            if (azionSolution) {
              // Add console error details for errors-in-console audit
              const auditData = { ...audit };
              if (auditId === 'errors-in-console' && audit.console_errors) {
                const consoleErrorCount = audit.console_error_count || 0;
                const errorTypes = [...new Set(audit.console_errors.map((error: any) => error.source || 'console.error'))] as string[];

                auditData.console_error_summary = {
                  total_errors: consoleErrorCount,
                  error_types: errorTypes,
                  sample_errors: audit.console_errors.slice(0, 3)
                };

                // Update campaign summary
                campaignData.summary.console_errors.has_console_errors = true;
                campaignData.summary.console_errors.total_console_errors = consoleErrorCount;
                campaignData.summary.console_errors.error_types = errorTypes;
              }

              categoryIssues.push({
                audit: auditData,
                azion_solution: azionSolution,
                severity: audit.impact || 'medium'
              });

              // Update summary
              campaignData.summary.total_issues += 1;
              const priority = azionSolution.priority;
              if (priority === 'high') {
                campaignData.summary.high_priority_issues += 1;
              } else if (priority === 'medium') {
                campaignData.summary.medium_priority_issues += 1;
              } else {
                campaignData.summary.low_priority_issues += 1;
              }

              // Track solutions
              for (const solution of azionSolution.solutions) {
                potentialSolutions.add(solution.id);
              }
            }
          }
        }
      }

      if (categoryIssues.length > 0) {
        campaignData.categories[categoryName] = {
          score: categoryData.score || 0,
          issues: categoryIssues,
          issue_count: categoryIssues.length
        };
      }
    }

    // Convert set to array for JSON serialization
    campaignData.summary.potential_solutions = Array.from(potentialSolutions);

    // Generate solutions overview
    for (const solutionId of campaignData.summary.potential_solutions) {
      if (solutionId in AZION_SOLUTIONS) {
        campaignData.solutions_overview[solutionId] = AZION_SOLUTIONS[solutionId];
      }
    }

    // Generate action plan (prioritized recommendations)
    const allIssues: any[] = [];
    for (const category of Object.values(campaignData.categories)) {
      allIssues.push(...category.issues);
    }

    // Sort by priority and potential impact
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    allIssues.sort((a, b) => {
      const aPriority = priorityOrder[a.azion_solution.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.azion_solution.priority as keyof typeof priorityOrder] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return (b.audit.score || 0) - (a.audit.score || 0);
    });

    // Create action plan with top recommendations
    for (const issue of allIssues.slice(0, 10)) {
      const audit = issue.audit;
      const solution = issue.azion_solution;
      const originalData = audit.original_pagespeed_data || {};

      const actionItem: ActionPlan = {
        title: audit.title || 'Performance Issue',
        description: solution.description,
        priority: solution.priority,
        category: audit.category || 'performance',
        potential_savings: audit.display_value || '',
        recommended_solutions: solution.solutions.map((s: AzionSolution) => s.name),
        implementation_complexity: solution.solutions.length === 1 ? 'low' : 'medium',
        pagespeed_insights_context: {
          original_description: originalData.description || '',
          current_value: audit.display_value || '',
          score: audit.score || 0,
          numeric_value: originalData.numeric_value,
          numeric_unit: originalData.numeric_unit || '',
          warnings: originalData.warnings || []
        }
      };

      // Add console error summary for errors-in-console audit
      if (audit.console_error_summary) {
        actionItem.console_error_details = audit.console_error_summary;
      }

      campaignData.action_plan.push(actionItem);
    }

    return campaignData;
  }

  private createEmptyMarketingData(): MarketingData {
    return {
      summary: {
        total_issues: 0,
        high_priority_issues: 0,
        medium_priority_issues: 0,
        low_priority_issues: 0,
        potential_solutions: [],
        estimated_impact: 'low',
        console_errors: {
          has_console_errors: false,
          total_console_errors: 0,
          error_types: []
        }
      },
      categories: {},
      solutions_overview: {},
      action_plan: []
    };
  }
}
