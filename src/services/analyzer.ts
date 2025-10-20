import { PageSpeedService } from './pagespeed';
import { AzionSolutionsService } from './azion-solutions';
import { CrUXService } from './crux';
import { ReportGeneratorService } from './report-generator';
import { AnalysisRequest, AnalysisResponse } from '../types';

export class AnalyzerService {
  private pageSpeedService: PageSpeedService;
  private azionSolutionsService: AzionSolutionsService;
  private cruxService: CrUXService;
  private reportGeneratorService: ReportGeneratorService;

  constructor() {
    this.pageSpeedService = new PageSpeedService();
    this.azionSolutionsService = new AzionSolutionsService();
    this.cruxService = new CrUXService();
    this.reportGeneratorService = new ReportGeneratorService();
  }

  async analyzeWebsite(request: AnalysisRequest): Promise<AnalysisResponse> {
    const { url, device = 'mobile', use_crux = false, weeks = 25, api_key } = request;
    
    if (!api_key) {
      throw new Error('API key is required for analysis');
    }
    
    console.log(`🔍 Analyzing ${url} (${device})...`);
    console.log(`🔑 Using API key: ${api_key.substring(0, 10)}...${api_key.substring(api_key.length - 4)}`);
    
    try {
      // Get PageSpeed Insights data
      console.log('📊 Fetching PageSpeed Insights data...');
      const pagespeedData = await this.pageSpeedService.getPageSpeedInsights(
        api_key, 
        url, 
        device as 'mobile' | 'desktop'
      );

      if (pagespeedData.error) {
        throw new Error(`PageSpeed API error: ${pagespeedData.error.message}`);
      }

      // Analyze data
      console.log('🔬 Analyzing performance data...');
      const analysis = this.pageSpeedService.analyzePageSpeedData(pagespeedData);

      if (!analysis) {
        throw new Error('Failed to analyze PageSpeed data');
      }

      // Get CrUX data if requested
      let cruxData = null;
      let cruxChartHtml = '';
      if (use_crux) {
        console.log('📊 Fetching CrUX History data...');
        const formFactor = device === 'mobile' ? 'PHONE' : device === 'desktop' ? 'DESKTOP' : 'TABLET';
        
        const cruxRawData = await this.cruxService.getCrUXHistory(api_key, url, formFactor, weeks);
        const pagespeedCoreVitals = this.cruxService.extractPageSpeedCoreVitals(pagespeedData);
        cruxData = this.cruxService.processCrUXData(cruxRawData, pagespeedCoreVitals);

        if (cruxData && cruxData.has_crux_data) {
          console.log(`✅ CrUX data integrated with ${cruxData.dates.length} data points`);
          cruxChartHtml = this.cruxService.createCoreVitalsChart(cruxData, url);
        } else if (cruxData && cruxData.has_pagespeed_data) {
          console.log('✅ Using PageSpeed Insights data for Core Web Vitals');
          cruxChartHtml = this.cruxService.createCoreVitalsChart(cruxData, url);
        }
      }

      // Generate Azion recommendations
      console.log('🎯 Generating Azion recommendations...');
      const azionRecommendations = this.azionSolutionsService.generateAzionRecommendations(analysis);

      // Generate reports
      const timestamp = new Date().toLocaleString();
      
      // HTML Report
      console.log('📄 Generating HTML report...');
      const htmlReport = this.reportGeneratorService.generateUnifiedHtmlReport(
        url, 
        analysis, 
        azionRecommendations, 
        timestamp, 
        cruxData || undefined,
        cruxChartHtml || undefined
      );

      // Generate marketing pitch
      const marketingPitch = this.formatMarketingPitch(azionRecommendations.marketing_data, url);

      console.log('✅ Analysis complete!');
      console.log(`📈 Summary:`);
      console.log(`  • Issues found: ${azionRecommendations.marketing_data.summary.total_issues}`);
      console.log(`  • High priority: ${azionRecommendations.marketing_data.summary.high_priority_issues}`);
      console.log(`  • Azion solutions: ${azionRecommendations.solution_count}`);

      return {
        url,
        device,
        timestamp,
        analysis,
        azion_recommendations: azionRecommendations,
        crux_data: cruxData || undefined,
        html_report: htmlReport,
        marketing_pitch: marketingPitch
      };

    } catch (error) {
      console.error('❌ Error during analysis:', error);
      throw error;
    }
  }

  private formatMarketingPitch(campaignData: any, url: string): any {
    const summary = campaignData.summary;
    
    // Calculate potential impact
    const impactScore = summary.high_priority_issues > 3 ? 'High' : 
                       summary.total_issues > 5 ? 'Medium' : 'Low';

    const pitch = {
      executive_summary: {
        website: url,
        issues_found: summary.total_issues,
        critical_issues: summary.high_priority_issues,
        potential_impact: impactScore,
        recommended_solutions: summary.potential_solutions.length
      },
      value_proposition: {
        performance_improvement: 'Up to 40% faster loading times',
        cost_reduction: 'Reduce bandwidth costs by 30-60%',
        security_enhancement: 'Enterprise-grade security protection',
        scalability: 'Handle 10x traffic spikes without issues'
      },
      solution_highlights: [] as any[],
      next_steps: [
        'Schedule a technical consultation',
        'Conduct a detailed performance audit',
        'Design a custom optimization strategy',
        'Implement Azion Edge Platform',
        'Monitor and optimize performance'
      ]
    };

    // Add solution highlights
    for (const [solutionId, solution] of Object.entries(campaignData.solutions_overview)) {
      const solutionData = solution as any;
      const highlight = {
        name: solutionData.name,
        description: solutionData.description,
        key_benefits: solutionData.benefits.slice(0, 3), // Top 3 benefits
        url: solutionData.url
      };
      pitch.solution_highlights.push(highlight);
    }

    return pitch;
  }

  validateApiKey(apiKey: string): boolean {
    // Basic validation - API keys should be at least 30 characters
    // and typically start with 'AIza' for Google APIs
    if (!apiKey || apiKey.length < 30) {
      console.log(`❌ API key validation failed: too short (${apiKey?.length || 0} characters)`);
      return false;
    }
    
    if (!apiKey.startsWith('AIza')) {
      console.log(`⚠️  API key doesn't start with 'AIza' - this might not be a valid Google API key`);
    }
    
    return true;
  }

  validateUrl(url: string): string {
    if (!url) {
      throw new Error('URL is required');
    }
    
    // Add https if no protocol specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    try {
      new URL(url);
      return url;
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  }
}
