// Core interfaces for the PageSpeed Insights analyzer

export interface PageSpeedInsightsResponse {
  lighthouseResult: {
    audits: Record<string, Audit>;
    categories: Record<string, Category>;
  };
  error?: {
    message: string;
  };
}

export interface Audit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
  numericValue?: number;
  numericUnit?: string;
  scoreDisplayMode?: string;
  explanation?: string;
  details?: any;
  warnings?: string[];
}

export interface Category {
  id: string;
  title: string;
  score: number;
}

export interface AnalysisResult {
  performance: CategoryAnalysis;
  accessibility: CategoryAnalysis;
  best_practices: CategoryAnalysis;
  seo: CategoryAnalysis;
}

export interface CategoryAnalysis {
  score: number;
  issues: IssueInfo[];
}

export interface IssueInfo {
  id: string;
  title: string;
  description: string;
  score: number;
  display_value: string;
  impact: 'high' | 'medium' | 'low';
  original_pagespeed_data: {
    description: string;
    explanation: string;
    score_display_mode: string;
    numeric_value?: number;
    numeric_unit: string;
    details: any;
    warnings: string[];
  };
  console_errors?: ConsoleError[];
  console_error_count?: number;
}

export interface ConsoleError {
  description: string;
  source: string;
  source_location: {
    url: string;
    line: number;
    column: number;
  };
}

export interface AzionSolution {
  id: string;
  name: string;
  description: string;
  features: string[];
  benefits: string[];
  url: string;
}

export interface AzionRecommendation {
  audit_id: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  solutions: AzionSolution[];
  audit_data?: IssueInfo;
}

export interface AzionRecommendations {
  recommendations: {
    category: string;
    issue: IssueInfo;
    azion_solution: AzionRecommendation;
  }[];
  marketing_data: MarketingData;
  solution_count: number;
}

export interface MarketingData {
  summary: {
    total_issues: number;
    high_priority_issues: number;
    medium_priority_issues: number;
    low_priority_issues: number;
    potential_solutions: string[];
    estimated_impact: string;
    console_errors: {
      has_console_errors: boolean;
      total_console_errors: number;
      error_types: string[];
    };
  };
  categories: Record<string, any>;
  solutions_overview: Record<string, AzionSolution>;
  action_plan: ActionPlan[];
}

export interface ActionPlan {
  title: string;
  description: string;
  priority: string;
  category: string;
  potential_savings: string;
  recommended_solutions: string[];
  implementation_complexity: string;
  pagespeed_insights_context: {
    original_description: string;
    current_value: string;
    score: number;
    numeric_value?: number;
    numeric_unit: string;
    warnings: string[];
  };
  console_error_details?: {
    total_errors: number;
    error_types: string[];
    sample_errors: ConsoleError[];
  };
}

export interface CrUXData {
  record: {
    key: {
      url: string;
      formFactor: string;
    };
    metrics: Record<string, CrUXMetric>;
    collectionPeriods: CrUXPeriod[];
  };
  error?: {
    message: string;
  };
}

export interface CrUXMetric {
  percentilesTimeseries: {
    p75s: number[];
  };
  histogramTimeseries: any[];
}

export interface CrUXPeriod {
  lastDate: {
    year: number;
    month: number;
    day: number;
  };
}

export interface ProcessedCrUXData {
  dates: string[];
  metrics: Record<string, {
    p75: number[];
    histogram: any[];
  }>;
  has_pagespeed_data: boolean;
  has_crux_data: boolean;
}

export interface CoreWebVitals {
  largest_contentful_paint?: number;
  first_contentful_paint?: number;
  cumulative_layout_shift?: number;
  interaction_to_next_paint?: number;
  experimental_time_to_first_byte?: number;
}

export interface AnalysisRequest {
  url: string;
  device?: 'mobile' | 'desktop' | 'tablet';
  use_crux?: boolean;
  weeks?: number;
  api_key?: string;
}

export interface AnalysisResponse {
  url: string;
  device: string;
  timestamp: string;
  analysis: AnalysisResult;
  azion_recommendations: AzionRecommendations;
  crux_data?: ProcessedCrUXData;
  html_report: string;
  marketing_pitch?: any;
}
