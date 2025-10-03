"""
Azion Platform Solutions Mapping System
Maps PageSpeed Insights recommendations to Azion Platform solutions for marketing campaigns.
"""

# Comprehensive Azion Platform Solutions Mapping
# Updated with latest product features and capabilities from Azion MCP documentation
AZION_SOLUTIONS = {
    "applications": {
        "name": "Applications",
        "description": "Build and deploy applications that run directly on Azion's distributed network",
        "features": [
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
        "benefits": [
            "Reduced latency through edge delivery",
            "Improved Core Web Vitals scores",
            "Enhanced user experience",
            "Reduced origin server load",
            "Automatic bandwidth savings through compression",
            "Faster page load times with compressed content"
        ],
        "url": "https://www.azion.com/en/products/applications/"
    },
    "functions": {
        "name": "Functions",
        "description": "Create event-driven, serverless applications at the edge of the network",
        "features": [
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
        "benefits": [
            "Request/response manipulation",
            "Dynamic content generation",
            "Authentication and authorization",
            "A/B testing and feature flags",
            "Bot detection and mitigation",
            "Geolocation-based routing",
            "API composition and transformation"
        ],
        "url": "https://www.azion.com/en/products/functions/"
    },
    "cache": {
        "name": "Cache",
        "description": "Advanced caching system that reduces latency and improves performance",
        "features": [
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
        "benefits": [
            "Reduces server response time (TTFB)",
            "Improves loading performance",
            "Reduces bandwidth costs",
            "Handles traffic spikes",
            "Caches compressed content for faster delivery",
            "Reduces origin bandwidth through compression"
        ],
        "url": "https://www.azion.com/en/products/cache/"
    },
    "tiered_cache": {
        "name": "Tiered Cache",
        "description": "Multi-layer caching architecture for enhanced performance and reduced origin load",
        "features": [
            "Two-tier caching system (Edge + Regional)",
            "Reduced origin bandwidth consumption",
            "Improved cache hit ratios",
            "Automatic tier promotion based on popularity",
            "Configurable per cache setting",
            "Minimum 3-second TTL requirement",
            "Regional cache layer optimization"
        ],
        "benefits": [
            "Reduces origin requests",
            "Improves cache hit ratio",
            "Faster content delivery",
            "Better scalability"
        ],
        "url": "https://www.azion.com/en/products/tiered-cache/"
    },
    "image_processor": {
        "name": "Image Processor",
        "description": "Automatic image optimization and transformation service",
        "features": [
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
        "benefits": [
            "Reduces image file sizes",
            "Serves next-gen formats",
            "Improves loading performance",
            "Saves bandwidth"
        ],
        "url": "https://www.azion.com/en/products/image-processor/"
    },
    "firewall": {
        "name": "Firewall",
        "description": "Comprehensive security solution protecting applications from various threats",
        "features": [
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
        "benefits": [
            "Blocks malicious requests",
            "Improves security posture",
            "Reduces server load",
            "Prevents attacks"
        ],
        "url": "https://www.azion.com/en/products/firewall/"
    },
    "load_balancer": {
        "name": "Load Balancer",
        "description": "Intelligent traffic distribution across multiple origins",
        "features": [
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
        "benefits": [
            "Improves availability",
            "Distributes traffic efficiently",
            "Reduces response times",
            "Handles failures gracefully"
        ],
        "url": "https://www.azion.com/en/products/load-balancer/"
    },
    "object_storage": {
        "name": "Object Storage",
        "description": "Scalable and secure S3-compatible object storage service",
        "features": [
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
        "benefits": [
            "Static website hosting",
            "Media and asset storage",
            "Data archiving and backup",
            "Content distribution"
        ],
        "url": "https://www.azion.com/en/products/object-storage/"
    },
    "sql_database": {
        "name": "SQL Database",
        "description": "Edge-native SQL solution with vector search capabilities",
        "features": [
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
        "benefits": [
            "Semantic search engines",
            "AI-powered recommendations",
            "RAG implementations",
            "Real-time data processing"
        ],
        "url": "https://www.azion.com/en/products/sql-database/"
    },
    "edge_dns": {
        "name": "Edge DNS",
        "description": "Authoritative DNS service with advanced features",
        "features": [
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
        "benefits": [
            "Reduces DNS lookup time",
            "Improves initial connection",
            "Enhances security",
            "Better reliability"
        ],
        "url": "https://www.azion.com/en/products/edge-dns/"
    },
    "ai_inference": {
        "name": "AI Inference",
        "description": "Run AI models directly on Azion's edge infrastructure",
        "features": [
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
        "benefits": [
            "AI agents deployment with ultra-low latency",
            "Real-time AI processing at the edge",
            "Vector search and semantic queries",
            "Advanced AI architectures"
        ],
        "url": "https://www.azion.com/en/products/ai-inference/"
    },
    "certificate_manager": {
        "name": "Certificate Manager",
        "description": "Automated SSL/TLS certificate management",
        "features": [
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
        "benefits": [
            "Automated certificate lifecycle",
            "Enhanced security posture",
            "Reduced maintenance overhead",
            "Improved compliance"
        ],
        "url": "https://www.azion.com/en/products/certificate-manager/"
    },
    "best_practices_review": {
        "name": "Best Practices Review",
        "description": "Thorough evaluation of infrastructure with expert recommendations to optimize performance, security, and efficiency",
        "features": [
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
        "benefits": [
            "Improved application performance and security",
            "Cost optimization through expert analysis",
            "Source code optimization recommendations",
            "Unused resource identification and cleanup",
            "Industry best practices implementation",
            "Expert guidance for complex optimizations"
        ],
        "url": "https://www.azion.com/en/documentation/services/best-practices-review/"
    }
}

# Mapping PageSpeed Insights audit IDs to Azion solutions
PAGESPEED_TO_AZION_MAPPING = {
    # Performance Optimizations
    "server-response-time": {
        "solutions": ["cache", "tiered_cache", "load_balancer", "functions"],
        "priority": "high",
        "description": "Dramatically improve server response times with multi-layer caching, load balancing, and edge processing"
    },
    "render-blocking-resources": {
        "solutions": ["functions", "applications", "cache"],
        "priority": "high", 
        "description": "Use Edge Functions to inline critical CSS/JS, modify resource loading order, and implement advanced optimization techniques"
    },
    "unused-css-rules": {
        "solutions": ["best_practices_review"],
        "priority": "medium",
        "description": "Azion's Best Practices Review service provides expert analysis to identify and remove unused CSS rules from your source code, along with recommendations for CSS optimization and build process improvements"
    },
    "unused-javascript": {
        "solutions": ["best_practices_review"],
        "priority": "medium",
        "description": "Azion's Best Practices Review service provides expert analysis to identify and remove unused JavaScript code from your source code, along with recommendations for tree-shaking, code splitting, and build optimization strategies"
    },
    "modern-image-formats": {
        "solutions": ["image_processor", "functions"],
        "priority": "high",
        "description": "Automatically convert images to WebP/AVIF formats with intelligent browser detection and quality optimization"
    },
    "uses-webp-images": {
        "solutions": ["image_processor", "cache"],
        "priority": "high",
        "description": "Serve WebP images automatically based on browser support with intelligent caching strategies"
    },
    "uses-optimized-images": {
        "solutions": ["image_processor", "cache", "functions"],
        "priority": "high",
        "description": "Comprehensive image optimization including compression, resizing, format conversion, and smart caching"
    },
    "uses-responsive-images": {
        "solutions": ["image_processor", "functions", "applications"],
        "priority": "medium",
        "description": "Serve appropriately sized images based on device, viewport, and network conditions using adaptive delivery"
    },
    "offscreen-images": {
        "solutions": ["image_processor", "functions", "cache"],
        "priority": "medium",
        "description": "Implement intelligent lazy loading, optimize off-screen image delivery, and progressive image loading"
    },
    "uses-text-compression": {
        "solutions": ["applications", "cache"],
        "priority": "high",
        "description": "Enable automatic GZIP/Brotli compression for all text-based content (HTML, CSS, JS, JSON, XML) with intelligent algorithm selection based on content type and client support. Azion Applications provide built-in compression with intelligent caching strategies."
    },
    "unminified-css": {
        "solutions": ["best_practices_review"],
        "priority": "medium",
        "description": "Azion's Best Practices Review service provides expert recommendations for implementing CSS minification in your build process, along with build tool configuration and optimization strategies for maximum size reduction"
    },
    "unminified-javascript": {
        "solutions": ["best_practices_review"],
        "priority": "medium",
        "description": "Azion's Best Practices Review service provides expert recommendations for implementing JavaScript minification in your build process, including bundling optimization, tree-shaking configuration, and build tool setup"
    },
    "uses-long-cache-ttl": {
        "solutions": ["cache", "tiered_cache", "applications"],
        "priority": "high",
        "description": "Configure optimal cache TTL values with intelligent cache policies and multi-layer caching architecture"
    },
    "total-byte-weight": {
        "solutions": ["image_processor", "applications", "cache", "tiered_cache"],
        "priority": "medium",
        "description": "Comprehensive payload reduction through image optimization, text compression (GZIP/Brotli), intelligent caching, and edge processing"
    },
    "uses-http2": {
        "solutions": ["applications", "load_balancer", "cache"],
        "priority": "medium",
        "description": "Enable HTTP/2 and HTTP/3 for multiplexed connections, server push, and enhanced performance"
    },
    "efficient-animated-content": {
        "solutions": ["image_processor", "functions", "cache"],
        "priority": "medium",
        "description": "Convert animated GIFs to optimized video formats with intelligent format selection and caching"
    },
    
    # Security & Best Practices
    "is-on-https": {
        "solutions": ["applications", "certificate_manager", "load_balancer"],
        "priority": "high",
        "description": "Enforce HTTPS connections with automatic certificate management, SSL/TLS termination, and security headers"
    },
    "no-vulnerable-libraries": {
        "solutions": ["firewall", "functions", "applications"],
        "priority": "high",
        "description": "Block requests targeting vulnerable libraries, implement security scanning, and update dependencies automatically"
    },
    "external-anchors-use-rel-noopener": {
        "solutions": ["functions", "firewall", "applications"],
        "priority": "medium",
        "description": "Add security headers, modify HTML to include rel='noopener', and implement comprehensive link security"
    },
    "csp-xss": {
        "solutions": ["firewall", "functions", "applications"],
        "priority": "high",
        "description": "Implement Content Security Policy headers, XSS protection, and comprehensive security rule enforcement"
    },
    
    # SEO Optimizations
    "crawlable-anchors": {
        "solutions": ["functions", "applications", "cache"],
        "priority": "medium",
        "description": "Ensure proper URL structure, crawlable navigation, and SEO-optimized routing with edge processing"
    },
    "robots-txt": {
        "solutions": ["functions", "applications", "object_storage"],
        "priority": "low",
        "description": "Serve optimized robots.txt files based on environment, user agent, and dynamic SEO requirements"
    },
    "canonical": {
        "solutions": ["functions", "applications"],
        "priority": "medium",
        "description": "Add canonical URLs dynamically, prevent duplicate content, and implement intelligent URL normalization"
    },
    "hreflang": {
        "solutions": ["functions", "applications", "edge_dns"],
        "priority": "medium",
        "description": "Implement hreflang tags for international SEO with geolocation-based routing and content delivery"
    },
    
    # Accessibility & User Experience
    "image-alt": {
        "solutions": ["best_practices_review"],
        "priority": "high",
        "description": "Azion's Best Practices Review service provides expert guidance for adding proper alt attributes to images in your source code, including accessibility best practices, SEO optimization, and automated testing strategies for image accessibility compliance"
    },
    "label": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Inject proper form labels and ARIA attributes at the edge to improve accessibility"
    },
    "link-name": {
        "solutions": ["best_practices_review"],
        "priority": "high",
        "description": "Azion's Best Practices Review service provides expert recommendations for improving link accessibility in your source code, including descriptive link text, ARIA labels, and accessibility testing strategies to ensure proper screen reader compatibility"
    },
    "button-name": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Add accessible names to buttons using edge-side DOM manipulation and ARIA enhancements"
    },
    "heading-order": {
        "solutions": ["functions", "applications"],
        "priority": "medium",
        "description": "Restructure heading hierarchy at the edge to ensure proper semantic order"
    },
    "html-has-lang": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Add language attributes to HTML elements based on geolocation and content analysis"
    },
    "html-lang-valid": {
        "solutions": ["functions", "applications"],
        "priority": "medium",
        "description": "Validate and correct language attributes using edge-side content processing"
    },
    "frame-title": {
        "solutions": ["functions", "applications"],
        "priority": "medium",
        "description": "Add descriptive titles to iframe elements for improved accessibility"
    },
    "duplicate-id-active": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Fix duplicate IDs in interactive elements using edge-side DOM processing"
    },
    "duplicate-id-aria": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Resolve duplicate ARIA IDs to ensure proper accessibility support"
    },
    "meta-viewport": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Add or optimize viewport meta tags for responsive design and accessibility"
    },
    "tabindex": {
        "solutions": ["functions", "applications"],
        "priority": "medium",
        "description": "Optimize tab order and remove problematic tabindex values at the edge"
    },
    "video-caption": {
        "solutions": ["functions", "ai_inference"],
        "priority": "high",
        "description": "Generate and inject video captions using AI-powered transcription services"
    },
    "aria-required-attr": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Add missing required ARIA attributes to improve screen reader compatibility"
    },
    "aria-valid-attr": {
        "solutions": ["functions", "applications"],
        "priority": "medium",
        "description": "Validate and correct ARIA attributes using edge-side processing"
    },
    "bypass": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Add skip links and navigation bypasses for keyboard users"
    },
    
    # Network & Infrastructure
    "third-party-summary": {
        "solutions": ["functions", "firewall", "applications"],
        "priority": "medium",
        "description": "Control and optimize third-party resource loading with intelligent filtering and performance monitoring"
    },
    "bootup-time": {
        "solutions": ["best_practices_review"],
        "priority": "medium",
        "description": "Azion's Best Practices Review service provides expert analysis of JavaScript execution time issues, including code splitting strategies, bundle optimization, lazy loading implementation, and build process improvements to reduce main thread blocking time"
    },
    "mainthread-work-breakdown": {
        "solutions": ["best_practices_review"],
        "priority": "medium",
        "description": "Azion's Best Practices Review service provides expert analysis of main thread work optimization, including JavaScript performance profiling, code splitting recommendations, Web Workers implementation, and async/await optimization strategies to reduce main thread blocking"
    },
    
    # Advanced Performance & Core Web Vitals
    "largest-contentful-paint": {
        "solutions": ["cache", "image_processor", "functions", "tiered_cache"],
        "priority": "high",
        "description": "Optimize LCP through intelligent caching, image optimization, and critical resource prioritization"
    },
    "cumulative-layout-shift": {
        "solutions": ["best_practices_review"],
        "priority": "high",
        "description": "Azion's Best Practices Review service provides expert guidance for preventing Cumulative Layout Shift through source code improvements, including proper image and video sizing, font loading optimization, and dynamic content insertion best practices"
    },
    "first-input-delay": {
        "solutions": ["best_practices_review"],
        "priority": "high",
        "description": "Azion's Best Practices Review service provides expert recommendations for reducing First Input Delay through client-side JavaScript optimization, including code splitting, event handler optimization, and main thread work reduction strategies"
    },
    "interaction-to-next-paint": {
        "solutions": ["best_practices_review"],
        "priority": "high",
        "description": "Azion's Best Practices Review service provides expert analysis for optimizing Interaction to Next Paint through client-side performance improvements, including event handler optimization, DOM manipulation efficiency, and JavaScript execution optimization"
    },
    
    # DNS & Domain Management
    "dns-prefetch": {
        "solutions": ["edge_dns", "functions", "applications"],
        "priority": "medium",
        "description": "Optimize DNS resolution with intelligent prefetching, authoritative DNS hosting, and traffic management"
    },
    
    # Content Delivery & Storage
    "static-assets": {
        "solutions": ["object_storage", "cache", "tiered_cache"],
        "priority": "medium",
        "description": "Optimize static asset delivery with S3-compatible storage, global edge distribution, and zero egress fees"
    },
    
    # Best Practices & Security
    "geolocation-on-start": {
        "solutions": ["functions", "firewall"],
        "priority": "medium",
        "description": "Implement user consent management and geolocation controls at the edge"
    },
    "notification-on-start": {
        "solutions": ["functions", "applications"],
        "priority": "medium",
        "description": "Manage notification permissions with user-friendly consent flows"
    },
    "password-inputs-can-be-pasted-into": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Remove paste restrictions on password fields to improve security and UX"
    },
    "has-doctype": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Ensure proper DOCTYPE declarations are present in all HTML documents"
    },
    "charset": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Add proper character encoding declarations to prevent rendering issues"
    },
    "js-libraries": {
        "solutions": ["functions", "firewall"],
        "priority": "high",
        "description": "Scan and update vulnerable JavaScript libraries with security monitoring"
    },
    "deprecations": {
        "solutions": ["best_practices_review"],
        "priority": "medium",
        "description": "Azion's Best Practices Review service provides expert guidance for replacing deprecated APIs and features with modern alternatives, including migration strategies and compatibility recommendations"
    },
    "third-party-cookies": {
        "solutions": ["functions", "firewall"],
        "priority": "high",
        "description": "Manage third-party cookies and implement privacy-compliant tracking solutions"
    },
    "inspector-issues": {
        "solutions": ["functions", "applications"],
        "priority": "medium",
        "description": "Fix browser console errors and warnings through edge-side optimization"
    },
    "csp-xss": {
        "solutions": ["firewall", "functions"],
        "priority": "high",
        "description": "Implement Content Security Policy headers to prevent XSS attacks"
    },
    "appcache-manifest": {
        "solutions": ["functions", "applications"],
        "priority": "medium",
        "description": "Replace deprecated AppCache with modern service worker implementations"
    },
    "image-aspect-ratio": {
        "solutions": ["image_processor", "functions"],
        "priority": "medium",
        "description": "Maintain proper image aspect ratios to prevent layout shifts"
    },
    "image-size-responsive": {
        "solutions": ["image_processor", "functions"],
        "priority": "high",
        "description": "Generate responsive images with appropriate sizes for different devices"
    },
    "preload-fonts": {
        "solutions": ["functions", "cache"],
        "priority": "medium",
        "description": "Optimize font loading with intelligent preloading and edge caching"
    },
    "errors-in-console": {
        "solutions": ["functions", "applications", "firewall"],
        "priority": "high",
        "description": "Fix JavaScript errors and console warnings through edge-side error handling and monitoring"
    },
    
    # Additional SEO Enhancements
    "structured-data": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Inject structured data markup for improved search engine understanding"
    },
    "http-status-code": {
        "solutions": ["functions", "applications", "edge_dns"],
        "priority": "high",
        "description": "Ensure proper HTTP status codes and implement intelligent redirects"
    },
    "link-text": {
        "solutions": ["functions", "applications"],
        "priority": "medium",
        "description": "Optimize link text for better SEO and accessibility"
    },
    "plugins": {
        "solutions": ["functions", "applications"],
        "priority": "high",
        "description": "Replace plugin-dependent content with modern web technologies"
    },
    
    # Performance Enhancements
    "uses-optimized-images": {
        "solutions": ["image_processor", "cache"],
        "priority": "high",
        "description": "Automatically optimize images with next-gen formats and compression"
    },
    "efficient-animated-content": {
        "solutions": ["image_processor", "functions"],
        "priority": "medium",
        "description": "Optimize animated content and convert to efficient formats"
    },
    "legacy-javascript": {
        "solutions": ["best_practices_review"],
        "priority": "medium",
        "description": "Azion's Best Practices Review service provides expert recommendations for modernizing legacy JavaScript code, including ES6+ migration strategies, polyfill optimization, and build process improvements for better browser compatibility"
    },
    "preload-lcp-image": {
        "solutions": ["functions", "cache", "image_processor"],
        "priority": "high",
        "description": "Preload Largest Contentful Paint images for faster rendering"
    },
    "uses-rel-preconnect": {
        "solutions": ["functions", "edge_dns"],
        "priority": "medium",
        "description": "Add preconnect hints for critical third-party resources"
    },
    "uses-rel-preload": {
        "solutions": ["functions", "cache"],
        "priority": "medium",
        "description": "Implement resource preloading for critical assets"
    },
    "critical-request-chains": {
        "solutions": ["functions", "cache", "tiered_cache"],
        "priority": "high",
        "description": "Optimize critical resource loading chains and dependencies"
    },
    "user-timings": {
        "solutions": ["data_streaming", "functions"],
        "priority": "low",
        "description": "Implement performance monitoring and user timing collection"
    },
    "total-byte-weight": {
        "solutions": ["image_processor", "applications", "cache"],
        "priority": "high",
        "description": "Reduce total page weight through GZIP/Brotli compression, image optimization, and intelligent caching"
    },
    "offscreen-images": {
        "solutions": ["image_processor", "functions"],
        "priority": "high",
        "description": "Implement lazy loading for offscreen images"
    },
    "unminified-css": {
        "solutions": ["best_practices_review"],
        "priority": "medium",
        "description": "Azion's Best Practices Review service provides expert recommendations for implementing CSS minification in your build process and optimizing build tools for maximum bandwidth reduction"
    },
    "unminified-javascript": {
        "solutions": ["best_practices_review"],
        "priority": "medium",
        "description": "Azion's Best Practices Review service provides expert recommendations for implementing JavaScript minification in your build process with bundling optimization and build tool configuration"
    },
    "uses-responsive-images": {
        "solutions": ["image_processor", "functions"],
        "priority": "high",
        "description": "Generate and serve responsive images based on device capabilities"
    }
}

def get_azion_solutions_for_audit(audit_id, audit_data=None):
    """
    Get Azion solutions for a specific PageSpeed Insights audit
    
    Args:
        audit_id: PageSpeed Insights audit identifier
        audit_data: Optional audit data for context
    
    Returns:
        dict: Azion solutions and recommendations
    """
    if audit_id not in PAGESPEED_TO_AZION_MAPPING:
        return None
    
    mapping = PAGESPEED_TO_AZION_MAPPING[audit_id]
    solutions = []
    
    for solution_id in mapping["solutions"]:
        if solution_id in AZION_SOLUTIONS:
            solution = AZION_SOLUTIONS[solution_id].copy()
            solution["id"] = solution_id
            solutions.append(solution)
    
    return {
        "audit_id": audit_id,
        "priority": mapping["priority"],
        "description": mapping["description"],
        "solutions": solutions,
        "audit_data": audit_data
    }

def generate_marketing_campaign_data(pagespeed_analysis):
    """
    Generate structured data for marketing campaigns based on PageSpeed analysis
    
    Args:
        pagespeed_analysis: Detailed PageSpeed Insights analysis
    
    Returns:
        dict: Marketing campaign data with issue -> solution mappings
    """
    campaign_data = {
        "summary": {
            "total_issues": 0,
            "high_priority_issues": 0,
            "medium_priority_issues": 0,
            "low_priority_issues": 0,
            "potential_solutions": set(),
            "estimated_impact": "high",
            "console_errors": {
                "has_console_errors": False,
                "total_console_errors": 0,
                "error_types": []
            }
        },
        "categories": {},
        "solutions_overview": {},
        "action_plan": []
    }
    
    # Process each category
    for category_name, category_data in pagespeed_analysis.items():
        if not isinstance(category_data, dict) or 'score' not in category_data:
            continue
            
        category_issues = []
        
        # Process issues in the category
        if 'issues' in category_data:
            for audit in category_data['issues']:
                audit_id = audit.get('id')
                if audit_id:
                    azion_solution = get_azion_solutions_for_audit(audit_id, audit)
                    if azion_solution:
                        # Add console error details for errors-in-console audit
                        audit_data = audit.copy()
                        if audit_id == 'errors-in-console' and audit.get('console_errors'):
                            console_error_count = audit.get('console_error_count', 0)
                            error_types = list(set(error.get('source', 'console.error') for error in audit.get('console_errors', [])))
                            
                            audit_data['console_error_summary'] = {
                                'total_errors': console_error_count,
                                'error_types': error_types,
                                'sample_errors': audit.get('console_errors', [])[:3]  # First 3 errors as samples
                            }
                            
                            # Update campaign summary
                            campaign_data["summary"]["console_errors"]["has_console_errors"] = True
                            campaign_data["summary"]["console_errors"]["total_console_errors"] = console_error_count
                            campaign_data["summary"]["console_errors"]["error_types"] = error_types
                        
                        category_issues.append({
                            "audit": audit_data,
                            "azion_solution": azion_solution,
                            "severity": audit.get('impact', 'medium')
                        })
                        
                        # Update summary
                        campaign_data["summary"]["total_issues"] += 1
                        priority = azion_solution["priority"]
                        if priority == "high":
                            campaign_data["summary"]["high_priority_issues"] += 1
                        elif priority == "medium":
                            campaign_data["summary"]["medium_priority_issues"] += 1
                        else:
                            campaign_data["summary"]["low_priority_issues"] += 1
                        
                        # Track solutions
                        for solution in azion_solution["solutions"]:
                            campaign_data["summary"]["potential_solutions"].add(solution["id"])
        
        if category_issues:
            campaign_data["categories"][category_name] = {
                "score": category_data.get("score", 0),
                "issues": category_issues,
                "issue_count": len(category_issues)
            }
    
    # Convert set to list for JSON serialization
    campaign_data["summary"]["potential_solutions"] = list(campaign_data["summary"]["potential_solutions"])
    
    # Generate solutions overview
    for solution_id in campaign_data["summary"]["potential_solutions"]:
        if solution_id in AZION_SOLUTIONS:
            campaign_data["solutions_overview"][solution_id] = AZION_SOLUTIONS[solution_id]
    
    # Generate action plan (prioritized recommendations)
    all_issues = []
    for category in campaign_data["categories"].values():
        all_issues.extend(category["issues"])
    
    # Sort by priority and potential impact
    priority_order = {"high": 3, "medium": 2, "low": 1}
    all_issues.sort(key=lambda x: (
        priority_order.get(x["azion_solution"]["priority"], 0),
        -x["audit"].get("score", 0)  # Lower scores = higher priority
    ), reverse=True)
    
    # Create action plan with top recommendations
    for issue in all_issues[:10]:  # Top 10 recommendations
        audit = issue["audit"]
        solution = issue["azion_solution"]
        
        # Get original PageSpeed context
        original_data = audit.get("original_pagespeed_data", {})
        
        action_item = {
            "title": audit.get("title", "Performance Issue"),
            "description": solution["description"],
            "priority": solution["priority"],
            "category": audit.get("category", "performance"),
            "potential_savings": audit.get("display_value", ""),
            "recommended_solutions": [s["name"] for s in solution["solutions"]],
            "implementation_complexity": "low" if len(solution["solutions"]) == 1 else "medium",
            "pagespeed_insights_context": {
                "original_description": original_data.get("description", ""),
                "current_value": audit.get("display_value", ""),
                "score": audit.get("score", 0),
                "numeric_value": original_data.get("numeric_value"),
                "numeric_unit": original_data.get("numeric_unit", ""),
                "warnings": original_data.get("warnings", [])
            }
        }
        
        # Add console error summary for errors-in-console audit
        if audit.get("console_error_summary"):
            action_item["console_error_details"] = audit["console_error_summary"]
        
        campaign_data["action_plan"].append(action_item)
    
    return campaign_data

def format_marketing_pitch(campaign_data, url):
    """
    Format marketing campaign data into a compelling pitch
    
    Args:
        campaign_data: Marketing campaign data
        url: Target website URL
    
    Returns:
        dict: Formatted marketing pitch
    """
    summary = campaign_data["summary"]
    
    # Calculate potential impact
    impact_score = "High" if summary["high_priority_issues"] > 3 else "Medium" if summary["total_issues"] > 5 else "Low"
    
    pitch = {
        "executive_summary": {
            "website": url,
            "issues_found": summary["total_issues"],
            "critical_issues": summary["high_priority_issues"],
            "potential_impact": impact_score,
            "recommended_solutions": len(summary["potential_solutions"])
        },
        "value_proposition": {
            "performance_improvement": "Up to 40% faster loading times",
            "cost_reduction": "Reduce bandwidth costs by 30-60%",
            "security_enhancement": "Enterprise-grade security protection",
            "scalability": "Handle 10x traffic spikes without issues"
        },
        "solution_highlights": [],
        "next_steps": [
            "Schedule a technical consultation",
            "Conduct a detailed performance audit",
            "Design a custom optimization strategy",
            "Implement Azion Edge Platform",
            "Monitor and optimize performance"
        ]
    }
    
    # Add solution highlights
    for solution_id, solution in campaign_data["solutions_overview"].items():
        highlight = {
            "name": solution["name"],
            "description": solution["description"],
            "key_benefits": solution["benefits"][:3],  # Top 3 benefits
            "url": solution["url"]
        }
        pitch["solution_highlights"].append(highlight)
    
    return pitch
