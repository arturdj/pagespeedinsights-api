/**
 * Example usage of the Azion PageSpeed Analyzer API
 * 
 * This example demonstrates how to use the API programmatically
 * Make sure the server is running on localhost:3000 before running this script
 */

const API_BASE_URL = 'http://localhost:3000';

// Example configuration
const analysisConfig = {
  url: 'https://www.azion.com',
  api_key: 'YOUR_PAGESPEED_INSIGHTS_API_KEY', // Replace with your actual API key
  device: 'mobile',
  use_crux: true,
  weeks: 25
};

/**
 * Perform website analysis
 */
async function analyzeWebsite() {
  try {
    console.log('🔍 Starting website analysis...');
    console.log(`📊 Analyzing: ${analysisConfig.url}`);
    
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analysisConfig)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis failed');
    }

    const result = await response.json();
    
    console.log('✅ Analysis completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`  • Overall Performance Score: ${Math.round(result.analysis.performance.score)}/100`);
    console.log(`  • Accessibility Score: ${Math.round(result.analysis.accessibility.score)}/100`);
    console.log(`  • SEO Score: ${Math.round(result.analysis.seo.score)}/100`);
    console.log(`  • Best Practices Score: ${Math.round(result.analysis.best_practices.score)}/100`);
    
    const summary = result.azion_recommendations.marketing_data.summary;
    console.log(`\n🎯 Optimization Opportunities:`);
    console.log(`  • Total Issues Found: ${summary.total_issues}`);
    console.log(`  • High Priority Issues: ${summary.high_priority_issues}`);
    console.log(`  • Recommended Azion Solutions: ${result.azion_recommendations.solution_count}`);
    
    if (summary.console_errors.has_console_errors) {
      console.log(`  • Console Errors: ${summary.console_errors.total_console_errors}`);
    }
    
    console.log(`\n📄 HTML Report Generated: ${result.html_report.length} characters`);
    
    // Display top 3 recommendations
    console.log('\n🔧 Top Recommendations:');
    result.azion_recommendations.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.issue.title}`);
      console.log(`     Priority: ${rec.azion_solution.priority.toUpperCase()}`);
      console.log(`     Solutions: ${rec.azion_solution.solutions.map(s => s.name).join(', ')}`);
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    throw error;
  }
}

/**
 * Generate HTML report and save to file (if running in Node.js environment)
 */
async function generateReport() {
  try {
    console.log('\n📄 Generating HTML report...');
    
    const response = await fetch(`${API_BASE_URL}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analysisConfig)
    });

    if (!response.ok) {
      throw new Error('Report generation failed');
    }

    const htmlContent = await response.text();
    console.log(`✅ HTML report generated: ${htmlContent.length} characters`);
    
    // In a browser environment, you could open the report in a new window:
    // const newWindow = window.open('', '_blank');
    // newWindow.document.write(htmlContent);
    // newWindow.document.close();
    
    return htmlContent;
    
  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
    throw error;
  }
}

/**
 * Check API health
 */
async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const health = await response.json();
    console.log('💚 API Health:', health.status);
    return health;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Azion PageSpeed Analyzer - Example Usage\n');
  
  // Check if API key is configured
  if (analysisConfig.api_key === 'YOUR_PAGESPEED_INSIGHTS_API_KEY') {
    console.log('⚠️  Please configure your PageSpeed Insights API key in the analysisConfig object');
    console.log('   Get your API key from: https://console.cloud.google.com/');
    return;
  }
  
  try {
    // Check API health
    await checkHealth();
    
    // Perform analysis
    const result = await analyzeWebsite();
    
    // Generate HTML report
    await generateReport();
    
    console.log('\n🎉 Example completed successfully!');
    console.log('💡 Try the manual interface at: http://localhost:3000/manual');
    console.log('📖 View API docs at: http://localhost:3000/docs');
    
  } catch (error) {
    console.error('\n💥 Example failed:', error.message);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeWebsite,
    generateReport,
    checkHealth,
    analysisConfig
  };
}

// Browser-compatible exports
if (typeof window !== 'undefined') {
  window.AzionAnalyzerExample = {
    analyzeWebsite,
    generateReport,
    checkHealth,
    analysisConfig
  };
}
