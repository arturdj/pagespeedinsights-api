/**
 * Azion Platform Solutions Mapping System
 * Maps PageSpeed Insights recommendations to Azion Platform solutions for marketing campaigns.
 */

// Comprehensive Azion Platform Solutions Mapping
export const AZION_SOLUTIONS = {
    applications: {
        name: "Applications",
        description: "Build and deploy applications that run directly on Azion's distributed network",
        features: [
            "Edge computing platform for web applications and APIs",
            "HTTP/2 and HTTP/3 support for multiplexed connections",
            "SSL/TLS termination and certificate management",
            "Custom domain support with automatic HTTPS",
            "Rules Engine for conditional business logic",
            "Device Groups for adaptive delivery",
            "Cache policies and TTL management",
            "Origin failover and health checks",
            "Real-time metrics and monitoring",
            "WebSocket support for real-time applications",
            "Automatic GZIP/Brotli compression for text-based content",
            "Streaming compression for large payloads",
            "Content-Type aware compression algorithms"
        ],
        benefits: [
            "Reduced latency through edge delivery",
            "Improved Core Web Vitals scores",
            "Enhanced user experience",
            "Reduced origin server load",
            "Automatic bandwidth savings through compression",
            "Faster page load times with compressed content"
        ],
        url: "https://www.azion.com/en/products/applications/"
    },
    functions: {
        name: "Functions",
        description: "Create event-driven, serverless applications at the edge of the network",
        features: [
            "JavaScript runtime with Node.js compatibility",
            "WebAssembly (WASM) support for high-performance execution",
            "AI Framework support with LangGraph and LangChain integrations",
            "Edge SQL integration for database operations",
            "WebSocket Proxy for real-time bidirectional communication",
            "5-minute CPU time limit with 20MB bundle support",
            "Environment variables and JSON Args support",
            "High-resolution timer for performance measurement",
            "Cache API for edge cache control",
            "ES Module support",
            "WinterTC API compatibility"
        ],
        benefits: [
            "Request/response manipulation",
            "Dynamic content generation",
            "Authentication and authorization",
            "A/B testing and feature flags",
            "Bot detection and mitigation",
            "Geolocation-based routing",
            "API composition and transformation"
        ],
        url: "https://www.azion.com/en/products/functions/"
    },
    cache: {
        name: "Cache",
        description: "Advanced caching system that reduces latency and improves performance",
        features: [
            "Intelligent cache policies with customizable TTL",
            "Advanced Cache Key with query string and cookie support",
            "Large File Optimization with 1024kB fragments",
            "Stale cache serving during origin failures",
            "HTTP method caching (POST, OPTIONS)",
            "Adaptive Delivery for device-specific content",
            "Cache purging and invalidation",
            "Browser cache control",
            "Bypass cache for dynamic content",
            "Cache status monitoring (HIT/MISS)",
            "Compressed content caching with automatic decompression",
            "Content-Encoding aware cache policies"
        ],
        benefits: [
            "Reduces server response time (TTFB)",
            "Improves loading performance",
            "Reduces bandwidth costs",
            "Handles traffic spikes",
            "Caches compressed content for faster delivery",
            "Reduces origin bandwidth through compression"
        ],
        url: "https://www.azion.com/en/products/cache/"
    },
    tiered_cache: {
        name: "Tiered Cache",
        description: "Multi-layer caching architecture for enhanced performance and reduced origin load",
        features: [
            "Two-tier caching system (Edge + Regional)",
            "Reduced origin bandwidth consumption",
            "Improved cache hit ratios",
            "Automatic tier promotion based on popularity",
            "Configurable per cache setting",
            "Minimum 3-second TTL requirement",
            "Regional cache layer optimization"
        ],
        benefits: [
            "Reduces origin requests",
            "Improves cache hit ratio",
            "Faster content delivery",
            "Better scalability"
        ],
        url: "https://www.azion.com/en/products/tiered-cache/"
    },
    image_processor: {
        name: "Image Processor",
        description: "Automatic image optimization and transformation service",
        features: [
            "Automatic WebP/AVIF conversion based on browser support",
            "Real-time image resizing and cropping",
            "Quality optimization with compression",
            "Format conversion (JPEG, PNG, WebP, AVIF)",
            "Responsive image delivery",
            "Lazy loading optimization",
            "Animated GIF to video conversion",
            "Smart cropping with focal point detection",
            "Watermark application",
            "WASM-based image processing for advanced operations"
        ],
        benefits: [
            "Reduces image file sizes",
            "Serves next-gen formats",
            "Improves loading performance",
            "Saves bandwidth"
        ],
        url: "https://www.azion.com/en/products/image-processor/"
    },
    firewall: {
        name: "Firewall",
        description: "Comprehensive security solution protecting applications from various threats",
        features: [
            "Web Application Firewall (WAF) with OWASP Top 10 protection",
            "DDoS Protection with automatic mitigation",
            "Bot Manager with advanced fingerprinting",
            "Rate Limiting and request throttling",
            "IP reputation and geoblocking",
            "Custom security rules with Rules Engine",
            "SSL/TLS encryption and certificate management",
            "Network Layer Protection (Layer 3/4)",
            "Real-time threat intelligence",
            "Security analytics and reporting"
        ],
        benefits: [
            "Blocks malicious requests",
            "Improves security posture",
            "Reduces server load",
            "Prevents attacks"
        ],
        url: "https://www.azion.com/en/products/firewall/"
    },
    load_balancer: {
        name: "Load Balancer",
        description: "Intelligent traffic distribution across multiple origins",
        features: [
            "Multiple balancing algorithms (Round-Robin, Least Connections, IP Hash)",
            "Health checks and automatic failover",
            "Weighted traffic distribution (1-10 scale)",
            "Primary/Backup server roles",
            "SSL termination and certificate management",
            "Session persistence and sticky sessions",
            "Geographic load balancing",
            "Real-time origin monitoring",
            "Automatic scaling based on demand",
            "Up to 10 origin addresses per configuration"
        ],
        benefits: [
            "Improves availability",
            "Distributes traffic efficiently",
            "Reduces response times",
            "Handles failures gracefully"
        ],
        url: "https://www.azion.com/en/products/load-balancer/"
    },
    object_storage: {
        name: "Object Storage",
        description: "Scalable and secure S3-compatible object storage service",
        features: [
            "S3-compatible API for seamless integration",
            "Global edge distribution",
            "Zero egress fees to Edge Applications",
            "Automatic data replication and backup",
            "Versioning and lifecycle management",
            "Access control and permissions",
            "Metadata and tagging support",
            "REST API and SDK support",
            "Universal data migration from major cloud providers",
            "Integration with Edge Functions for dynamic operations"
        ],
        benefits: [
            "Static website hosting",
            "Media and asset storage",
            "Data archiving and backup",
            "Content distribution"
        ],
        url: "https://www.azion.com/en/products/object-storage/"
    },
    sql_database: {
        name: "SQL Database",
        description: "Edge-native SQL solution with vector search capabilities",
        features: [
            "SQLite dialect with ACID compliance",
            "Distributed Main/Replica architecture",
            "Vector Search with semantic capabilities",
            "Ultra-low latency querying at the edge",
            "LangChain Vector Store integration",
            "Hybrid search (vector + full-text)",
            "Edge Functions integration",
            "Real-time data synchronization",
            "Automatic scaling and replication",
            "SQL shell for migrations"
        ],
        benefits: [
            "Semantic search engines",
            "AI-powered recommendations",
            "RAG implementations",
            "Real-time data processing"
        ],
        url: "https://www.azion.com/en/products/sql-database/"
    },
    edge_dns: {
        name: "Edge DNS",
        description: "Authoritative DNS service with advanced features",
        features: [
            "Authoritative DNS hosting",
            "DNSSEC support for response authentication",
            "Intelligent routing and traffic management",
            "Wildcard record support",
            "Weighted and geolocation-based routing",
            "Health checks and failover",
            "Real-time DNS analytics",
            "Massive redirect capabilities",
            "Domain migration tools",
            "Multiple record types support"
        ],
        benefits: [
            "Reduces DNS lookup time",
            "Improves initial connection",
            "Enhances security",
            "Better reliability"
        ],
        url: "https://www.azion.com/en/products/edge-dns/"
    },
    ai_inference: {
        name: "AI Inference",
        description: "Run AI models directly on Azion's edge infrastructure",
        features: [
            "Edge-optimized AI model execution",
            "Support for LLMs, VLMs, and multimodal models",
            "Low-Rank Adaptation (LoRA) for model customization",
            "Real-time AI processing with ultra-low latency",
            "Integration with Edge Functions and SQL Database",
            "OpenAI API standard compatibility",
            "Vector embeddings and reranking models",
            "AI agent deployment and orchestration",
            "Retrieval-Augmented Generation (RAG) support",
            "Multi-language model support"
        ],
        benefits: [
            "AI agents deployment with ultra-low latency",
            "Real-time AI processing at the edge",
            "Vector search and semantic queries",
            "Advanced AI architectures"
        ],
        url: "https://www.azion.com/en/products/ai-inference/"
    },
    certificate_manager: {
        name: "Certificate Manager",
        description: "Automated SSL/TLS certificate management",
        features: [
            "Let's Encrypt integration with HTTP-01 challenge",
            "Automatic certificate renewal",
            "Custom certificate upload",
            "Wildcard certificate support",
            "Multi-domain (SAN) certificates",
            "Certificate monitoring and alerts",
            "API-based certificate management",
            "Zero-downtime certificate updates",
            "Integration with Edge Applications",
            "Compliance with security standards"
        ],
        benefits: [
            "Automated certificate lifecycle",
            "Enhanced security posture",
            "Reduced maintenance overhead",
            "Improved compliance"
        ],
        url: "https://www.azion.com/en/products/certificate-manager/"
    },
    best_practices_review: {
        name: "Best Practices Review",
        description: "Thorough evaluation of infrastructure with expert recommendations to optimize performance, security, and efficiency",
        features: [
            "In-depth analysis of workload and infrastructure",
            "Application performance and security assessment",
            "Security measures evaluation and recommendations",
            "Cost optimization analysis and strategies",
            "Source code review and optimization recommendations",
            "Unused code identification and removal guidance",
            "Best practices implementation roadmap",
            "Industry-leading standards compliance review",
            "Expert consultation with Azion specialists",
            "Yearly hours included with Enterprise and Mission Critical plans"
        ],
        benefits: [
            "Improved application performance and security",
            "Cost optimization through expert analysis",
            "Source code optimization recommendations",
            "Unused resource identification and cleanup",
            "Industry best practices implementation",
            "Expert guidance for complex optimizations"
        ],
        url: "https://www.azion.com/en/documentation/services/best-practices-review/"
    }
};

// Mapping PageSpeed Insights audit IDs to Azion solutions
export const PAGESPEED_TO_AZION_MAPPING = {
    // Performance Optimizations
    "server-response-time": {
        solutions: ["cache", "tiered_cache", "load_balancer", "functions"],
        priority: "high",
        description: "Dramatically improve server response times with multi-layer caching, load balancing, and edge processing"
    },
    "render-blocking-resources": {
        solutions: ["functions", "applications", "cache"],
        priority: "high",
        description: "Use Edge Functions to inline critical CSS/JS, modify resource loading order, and implement advanced optimization techniques"
    },
    "unused-css-rules": {
        solutions: ["best_practices_review"],
        priority: "medium",
        description: "Azion's Best Practices Review service provides expert analysis to identify and remove unused CSS rules from your source code, along with recommendations for CSS optimization and build process improvements"
    },
    "unused-javascript": {
        solutions: ["best_practices_review"],
        priority: "medium",
        description: "Azion's Best Practices Review service provides expert analysis to identify and remove unused JavaScript code from your source code, along with recommendations for tree-shaking, code splitting, and build optimization strategies"
    },
    "modern-image-formats": {
        solutions: ["image_processor", "functions"],
        priority: "high",
        description: "Automatically convert images to WebP/AVIF formats with intelligent browser detection and quality optimization"
    },
    "uses-webp-images": {
        solutions: ["image_processor", "cache"],
        priority: "high",
        description: "Serve WebP images automatically based on browser support with intelligent caching strategies"
    },
    "uses-optimized-images": {
        solutions: ["image_processor", "cache", "functions"],
        priority: "high",
        description: "Comprehensive image optimization including compression, resizing, format conversion, and smart caching"
    },
    "uses-responsive-images": {
        solutions: ["image_processor", "functions", "applications"],
        priority: "medium",
        description: "Serve appropriately sized images based on device, viewport, and network conditions using adaptive delivery"
    },
    "offscreen-images": {
        solutions: ["image_processor", "functions", "cache"],
        priority: "medium",
        description: "Implement intelligent lazy loading, optimize off-screen image delivery, and progressive image loading"
    },
    "uses-text-compression": {
        solutions: ["applications", "cache"],
        priority: "high",
        description: "Enable automatic GZIP/Brotli compression for all text-based content (HTML, CSS, JS, JSON, XML) with intelligent algorithm selection based on content type and client support. Azion Applications provide built-in compression with intelligent caching strategies."
    },
    "unminified-css": {
        solutions: ["best_practices_review"],
        priority: "medium",
        description: "Azion's Best Practices Review service provides expert recommendations for implementing CSS minification in your build process, along with build tool configuration and optimization strategies for maximum size reduction"
    },
    "unminified-javascript": {
        solutions: ["best_practices_review"],
        priority: "medium",
        description: "Azion's Best Practices Review service provides expert recommendations for implementing JavaScript minification in your build process, including bundling optimization, tree-shaking configuration, and build tool setup"
    },
    "uses-long-cache-ttl": {
        solutions: ["cache", "tiered_cache", "applications"],
        priority: "high",
        description: "Configure optimal cache TTL values with intelligent cache policies and multi-layer caching architecture"
    },
    "total-byte-weight": {
        solutions: ["image_processor", "applications", "cache", "tiered_cache"],
        priority: "medium",
        description: "Comprehensive payload reduction through image optimization, text compression (GZIP/Brotli), intelligent caching, and edge processing"
    },
    "uses-http2": {
        solutions: ["applications", "load_balancer", "cache"],
        priority: "medium",
        description: "Enable HTTP/2 and HTTP/3 for multiplexed connections, server push, and enhanced performance"
    },
    "efficient-animated-content": {
        solutions: ["image_processor", "functions", "cache"],
        priority: "medium",
        description: "Convert animated GIFs to optimized video formats with intelligent format selection and caching"
    },
    
    // Security & Best Practices
    "is-on-https": {
        solutions: ["applications", "certificate_manager", "load_balancer"],
        priority: "high",
        description: "Enforce HTTPS connections with automatic certificate management, SSL/TLS termination, and security headers"
    },
    "no-vulnerable-libraries": {
        solutions: ["firewall", "functions", "applications"],
        priority: "high",
        description: "Block requests targeting vulnerable libraries, implement security scanning, and update dependencies automatically"
    },
    "external-anchors-use-rel-noopener": {
        solutions: ["functions", "firewall", "applications"],
        priority: "medium",
        description: "Add security headers, modify HTML to include rel='noopener', and implement comprehensive link security"
    },
    "csp-xss": {
        solutions: ["firewall", "functions", "applications"],
        priority: "high",
        description: "Implement Content Security Policy headers, XSS protection, and comprehensive security rule enforcement"
    },
    
    // SEO Optimizations
    "crawlable-anchors": {
        solutions: ["functions", "applications", "cache"],
        priority: "medium",
        description: "Ensure proper URL structure, crawlable navigation, and SEO-optimized routing with edge processing"
    },
    "robots-txt": {
        solutions: ["functions", "applications", "object_storage"],
        priority: "low",
        description: "Serve optimized robots.txt files based on environment, user agent, and dynamic SEO requirements"
    },
    "canonical": {
        solutions: ["functions", "applications"],
        priority: "medium",
        description: "Add canonical URLs dynamically, prevent duplicate content, and implement intelligent URL normalization"
    },
    "hreflang": {
        solutions: ["functions", "applications", "edge_dns"],
        priority: "medium",
        description: "Implement hreflang tags for international SEO with geolocation-based routing and content delivery"
    },
    
    // Accessibility & User Experience
    "image-alt": {
        solutions: ["best_practices_review"],
        priority: "high",
        description: "Azion's Best Practices Review service provides expert guidance for adding proper alt attributes to images in your source code, including accessibility best practices, SEO optimization, and automated testing strategies for image accessibility compliance"
    },
    "label": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Inject proper form labels and ARIA attributes at the edge to improve accessibility"
    },
    "link-name": {
        solutions: ["best_practices_review"],
        priority: "high",
        description: "Azion's Best Practices Review service provides expert recommendations for improving link accessibility in your source code, including descriptive link text, ARIA labels, and accessibility testing strategies to ensure proper screen reader compatibility"
    },
    "button-name": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Add accessible names to buttons using edge-side DOM manipulation and ARIA enhancements"
    },
    "heading-order": {
        solutions: ["functions", "applications"],
        priority: "medium",
        description: "Restructure heading hierarchy at the edge to ensure proper semantic order"
    },
    "html-has-lang": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Add language attributes to HTML elements based on geolocation and content analysis"
    },
    "html-lang-valid": {
        solutions: ["functions", "applications"],
        priority: "medium",
        description: "Validate and correct language attributes using edge-side content processing"
    },
    "frame-title": {
        solutions: ["functions", "applications"],
        priority: "medium",
        description: "Add descriptive titles to iframe elements for improved accessibility"
    },
    "duplicate-id-active": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Fix duplicate IDs in interactive elements using edge-side DOM processing"
    },
    "duplicate-id-aria": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Resolve duplicate ARIA IDs to ensure proper accessibility support"
    },
    "meta-viewport": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Add or optimize viewport meta tags for responsive design and accessibility"
    },
    "tabindex": {
        solutions: ["functions", "applications"],
        priority: "medium",
        description: "Optimize tab order and remove problematic tabindex values at the edge"
    },
    "video-caption": {
        solutions: ["functions", "ai_inference"],
        priority: "high",
        description: "Generate and inject video captions using AI-powered transcription services"
    },
    "aria-required-attr": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Add missing required ARIA attributes to improve screen reader compatibility"
    },
    "aria-valid-attr": {
        solutions: ["functions", "applications"],
        priority: "medium",
        description: "Validate and correct ARIA attributes using edge-side processing"
    },
    "bypass": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Add skip links and navigation bypasses for keyboard users"
    },
    
    // Network & Infrastructure
    "third-party-summary": {
        solutions: ["functions", "firewall", "applications"],
        priority: "medium",
        description: "Control and optimize third-party resource loading with intelligent filtering and performance monitoring"
    },
    "bootup-time": {
        solutions: ["best_practices_review"],
        priority: "medium",
        description: "Azion's Best Practices Review service provides expert analysis of JavaScript execution time issues, including code splitting strategies, bundle optimization, lazy loading implementation, and build process improvements to reduce main thread blocking time"
    },
    "mainthread-work-breakdown": {
        solutions: ["best_practices_review"],
        priority: "medium",
        description: "Azion's Best Practices Review service provides expert analysis of main thread work optimization, including JavaScript performance profiling, code splitting recommendations, Web Workers implementation, and async/await optimization strategies to reduce main thread blocking"
    },
    
    // Advanced Performance & Core Web Vitals
    "largest-contentful-paint": {
        solutions: ["cache", "image_processor", "functions", "tiered_cache"],
        priority: "high",
        description: "Optimize LCP through intelligent caching, image optimization, and critical resource prioritization"
    },
    "cumulative-layout-shift": {
        solutions: ["best_practices_review"],
        priority: "high",
        description: "Azion's Best Practices Review service provides expert guidance for preventing Cumulative Layout Shift through source code improvements, including proper image and video sizing, font loading optimization, and dynamic content insertion best practices"
    },
    "first-input-delay": {
        solutions: ["best_practices_review"],
        priority: "high",
        description: "Azion's Best Practices Review service provides expert recommendations for reducing First Input Delay through client-side JavaScript optimization, including code splitting, event handler optimization, and main thread work reduction strategies"
    },
    "interaction-to-next-paint": {
        solutions: ["best_practices_review"],
        priority: "high",
        description: "Azion's Best Practices Review service provides expert analysis for optimizing Interaction to Next Paint through client-side performance improvements, including event handler optimization, DOM manipulation efficiency, and JavaScript execution optimization"
    },
    
    // DNS & Domain Management
    "dns-prefetch": {
        solutions: ["edge_dns", "functions", "applications"],
        priority: "medium",
        description: "Optimize DNS resolution with intelligent prefetching, authoritative DNS hosting, and traffic management"
    },
    
    // Content Delivery & Storage
    "static-assets": {
        solutions: ["object_storage", "cache", "tiered_cache"],
        priority: "medium",
        description: "Optimize static asset delivery with S3-compatible storage, global edge distribution, and zero egress fees"
    },
    
    // Best Practices & Security
    "geolocation-on-start": {
        solutions: ["functions", "firewall"],
        priority: "medium",
        description: "Implement user consent management and geolocation controls at the edge"
    },
    "notification-on-start": {
        solutions: ["functions", "applications"],
        priority: "medium",
        description: "Manage notification permissions with user-friendly consent flows"
    },
    "password-inputs-can-be-pasted-into": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Remove paste restrictions on password fields to improve security and UX"
    },
    "has-doctype": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Ensure proper DOCTYPE declarations are present in all HTML documents"
    },
    "charset": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Add proper character encoding declarations to prevent rendering issues"
    },
    "js-libraries": {
        solutions: ["functions", "firewall"],
        priority: "high",
        description: "Scan and update vulnerable JavaScript libraries with security monitoring"
    },
    "deprecations": {
        solutions: ["best_practices_review"],
        priority: "medium",
        description: "Azion's Best Practices Review service provides expert guidance for replacing deprecated APIs and features with modern alternatives, including migration strategies and compatibility recommendations"
    },
    "third-party-cookies": {
        solutions: ["functions", "firewall"],
        priority: "high",
        description: "Manage third-party cookies and implement privacy-compliant tracking solutions"
    },
    "inspector-issues": {
        solutions: ["functions", "applications"],
        priority: "medium",
        description: "Fix browser console errors and warnings through edge-side optimization"
    },
    "appcache-manifest": {
        solutions: ["functions", "applications"],
        priority: "medium",
        description: "Replace deprecated AppCache with modern service worker implementations"
    },
    "image-aspect-ratio": {
        solutions: ["image_processor", "functions"],
        priority: "medium",
        description: "Maintain proper image aspect ratios to prevent layout shifts"
    },
    "image-size-responsive": {
        solutions: ["image_processor", "functions"],
        priority: "high",
        description: "Generate responsive images with appropriate sizes for different devices"
    },
    "preload-fonts": {
        solutions: ["functions", "cache"],
        priority: "medium",
        description: "Optimize font loading with intelligent preloading and edge caching"
    },
    "errors-in-console": {
        solutions: ["functions", "applications", "firewall"],
        priority: "high",
        description: "Fix JavaScript errors and console warnings through edge-side error handling and monitoring"
    },
    
    // Additional SEO Enhancements
    "structured-data": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Inject structured data markup for improved search engine understanding"
    },
    "http-status-code": {
        solutions: ["functions", "applications", "edge_dns"],
        priority: "high",
        description: "Ensure proper HTTP status codes and implement intelligent redirects"
    },
    "link-text": {
        solutions: ["functions", "applications"],
        priority: "medium",
        description: "Optimize link text for better SEO and accessibility"
    },
    "plugins": {
        solutions: ["functions", "applications"],
        priority: "high",
        description: "Replace plugin-dependent content with modern web technologies"
    },
    
    // Performance Enhancements
    "legacy-javascript": {
        solutions: ["best_practices_review"],
        priority: "medium",
        description: "Azion's Best Practices Review service provides expert recommendations for modernizing legacy JavaScript code, including ES6+ migration strategies, polyfill optimization, and build process improvements for better browser compatibility"
    },
    "preload-lcp-image": {
        solutions: ["functions", "cache", "image_processor"],
        priority: "high",
        description: "Preload Largest Contentful Paint images for faster rendering"
    },
    "uses-rel-preconnect": {
        solutions: ["functions", "edge_dns"],
        priority: "medium",
        description: "Add preconnect hints for critical third-party resources"
    },
    "uses-rel-preload": {
        solutions: ["functions", "cache"],
        priority: "medium",
        description: "Implement resource preloading for critical assets"
    },
    "critical-request-chains": {
        solutions: ["functions", "cache", "tiered_cache"],
        priority: "high",
        description: "Optimize critical resource loading chains and dependencies"
    },
    "user-timings": {
        solutions: ["data_streaming", "functions"],
        priority: "low",
        description: "Implement performance monitoring and user timing collection"
    }
};

/**
 * Get Azion solutions for a specific PageSpeed Insights audit
 * 
 * @param {string} auditId - PageSpeed Insights audit identifier
 * @param {Object} auditData - Optional audit data for context
 * @returns {Object|null} Azion solutions and recommendations
 */
export function getAzionSolutionsForAudit(auditId, auditData = null) {
    if (!PAGESPEED_TO_AZION_MAPPING[auditId]) {
        return null;
    }
    
    const mapping = PAGESPEED_TO_AZION_MAPPING[auditId];
    const solutions = [];
    
    for (const solutionId of mapping.solutions) {
        if (AZION_SOLUTIONS[solutionId]) {
            const solution = { ...AZION_SOLUTIONS[solutionId] };
            solution.id = solutionId;
            solutions.push(solution);
        }
    }
    
    return {
        auditId,
        priority: mapping.priority,
        description: mapping.description,
        solutions,
        auditData
    };
}

/**
 * Generate structured data for marketing campaigns based on PageSpeed analysis
 * 
 * @param {Object} pagespeedAnalysis - Detailed PageSpeed Insights analysis
 * @returns {Object} Marketing campaign data with issue -> solution mappings
 */
export function generateMarketingCampaignData(pagespeedAnalysis) {
    const campaignData = {
        summary: {
            totalIssues: 0,
            highPriorityIssues: 0,
            mediumPriorityIssues: 0,
            lowPriorityIssues: 0,
            potentialSolutions: new Set(),
            estimatedImpact: "high",
            consoleErrors: {
                hasConsoleErrors: false,
                totalConsoleErrors: 0,
                errorTypes: []
            }
        },
        categories: {},
        solutionsOverview: {},
        actionPlan: []
    };
    
    // Process each category
    for (const [categoryName, categoryData] of Object.entries(pagespeedAnalysis)) {
        if (typeof categoryData !== 'object' || !categoryData.score) {
            continue;
        }
            
        const categoryIssues = [];
        
        // Process issues in the category
        if (categoryData.issues) {
            for (const audit of categoryData.issues) {
                const auditId = audit.id;
                if (auditId) {
                    const azionSolution = getAzionSolutionsForAudit(auditId, audit);
                    if (azionSolution) {
                        // Add console error details for errors-in-console audit
                        const auditData = { ...audit };
                        if (auditId === 'errors-in-console' && audit.consoleErrors) {
                            const consoleErrorCount = audit.consoleErrorCount || 0;
                            const errorTypes = [...new Set(audit.consoleErrors.map(error => error.source || 'console.error'))];
                            
                            auditData.consoleErrorSummary = {
                                totalErrors: consoleErrorCount,
                                errorTypes,
                                sampleErrors: audit.consoleErrors.slice(0, 3) // First 3 errors as samples
                            };
                            
                            // Update campaign summary
                            campaignData.summary.consoleErrors.hasConsoleErrors = true;
                            campaignData.summary.consoleErrors.totalConsoleErrors = consoleErrorCount;
                            campaignData.summary.consoleErrors.errorTypes = errorTypes;
                        }
                        
                        categoryIssues.push({
                            audit: auditData,
                            azionSolution,
                            severity: audit.impact || 'medium'
                        });
                        
                        // Update summary
                        campaignData.summary.totalIssues += 1;
                        const priority = azionSolution.priority;
                        if (priority === "high") {
                            campaignData.summary.highPriorityIssues += 1;
                        } else if (priority === "medium") {
                            campaignData.summary.mediumPriorityIssues += 1;
                        } else {
                            campaignData.summary.lowPriorityIssues += 1;
                        }
                        
                        // Track solutions
                        for (const solution of azionSolution.solutions) {
                            campaignData.summary.potentialSolutions.add(solution.id);
                        }
                    }
                }
            }
        }
        
        if (categoryIssues.length > 0) {
            campaignData.categories[categoryName] = {
                score: categoryData.score || 0,
                issues: categoryIssues,
                issueCount: categoryIssues.length
            };
        }
    }
    
    // Convert set to array for JSON serialization
    campaignData.summary.potentialSolutions = Array.from(campaignData.summary.potentialSolutions);
    
    // Generate solutions overview
    for (const solutionId of campaignData.summary.potentialSolutions) {
        if (AZION_SOLUTIONS[solutionId]) {
            campaignData.solutionsOverview[solutionId] = AZION_SOLUTIONS[solutionId];
        }
    }
    
    // Generate action plan (prioritized recommendations)
    const allIssues = [];
    for (const category of Object.values(campaignData.categories)) {
        allIssues.push(...category.issues);
    }
    
    // Sort by priority and potential impact
    const priorityOrder = { "high": 3, "medium": 2, "low": 1 };
    allIssues.sort((a, b) => {
        const aPriority = priorityOrder[a.azionSolution.priority] || 0;
        const bPriority = priorityOrder[b.azionSolution.priority] || 0;
        const aScore = -(a.audit.score || 0); // Lower scores = higher priority
        const bScore = -(b.audit.score || 0);
        
        if (aPriority !== bPriority) {
            return bPriority - aPriority;
        }
        return aScore - bScore;
    });
    
    // Create action plan with top recommendations
    for (const issue of allIssues.slice(0, 10)) { // Top 10 recommendations
        const audit = issue.audit;
        const solution = issue.azionSolution;
        
        // Get original PageSpeed context
        const originalData = audit.originalPagespeedData || {};
        
        const actionItem = {
            title: audit.title || "Performance Issue",
            description: solution.description,
            priority: solution.priority,
            category: audit.category || "performance",
            potentialSavings: audit.displayValue || "",
            recommendedSolutions: solution.solutions.map(s => s.name),
            implementationComplexity: solution.solutions.length === 1 ? "low" : "medium",
            pagespeedInsightsContext: {
                originalDescription: originalData.description || "",
                currentValue: audit.displayValue || "",
                score: audit.score || 0,
                numericValue: originalData.numericValue,
                numericUnit: originalData.numericUnit || "",
                warnings: originalData.warnings || []
            }
        };
        
        // Add console error summary for errors-in-console audit
        if (audit.consoleErrorSummary) {
            actionItem.consoleErrorDetails = audit.consoleErrorSummary;
        }
        
        campaignData.actionPlan.push(actionItem);
    }
    
    return campaignData;
}

/**
 * Format marketing campaign data into a compelling pitch
 * 
 * @param {Object} campaignData - Marketing campaign data
 * @param {string} url - Target website URL
 * @returns {Object} Formatted marketing pitch
 */
export function formatMarketingPitch(campaignData, url) {
    const summary = campaignData.summary;
    
    // Calculate potential impact
    const impactScore = summary.highPriorityIssues > 3 ? "High" : 
                       summary.totalIssues > 5 ? "Medium" : "Low";
    
    const pitch = {
        executiveSummary: {
            website: url,
            issuesFound: summary.totalIssues,
            criticalIssues: summary.highPriorityIssues,
            potentialImpact: impactScore,
            recommendedSolutions: summary.potentialSolutions.length
        },
        valueProposition: {
            performanceImprovement: "Up to 40% faster loading times",
            costReduction: "Reduce bandwidth costs by 30-60%",
            securityEnhancement: "Enterprise-grade security protection",
            scalability: "Handle 10x traffic spikes without issues"
        },
        solutionHighlights: [],
        nextSteps: [
            "Schedule a technical consultation",
            "Conduct a detailed performance audit",
            "Design a custom optimization strategy",
            "Implement Azion Edge Platform",
            "Monitor and optimize performance"
        ]
    };
    
    // Add solution highlights
    for (const [solutionId, solution] of Object.entries(campaignData.solutionsOverview)) {
        const highlight = {
            name: solution.name,
            description: solution.description,
            keyBenefits: solution.benefits.slice(0, 3), // Top 3 benefits
            url: solution.url
        };
        pitch.solutionHighlights.push(highlight);
    }
    
    return pitch;
}
