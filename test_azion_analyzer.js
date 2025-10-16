#!/usr/bin/env node

/**
 * Test Suite for Azion PageSpeed Analyzer (JavaScript Version)
 * Basic validation tests for the converted JavaScript modules
 */

import { 
    AZION_SOLUTIONS, 
    PAGESPEED_TO_AZION_MAPPING,
    getAzionSolutionsForAudit,
    generateMarketingCampaignData,
    formatMarketingPitch
} from './azion_solutions.js';

import {
    getCruxHistory,
    extractPagespeedCoreVitals,
    processCruxData,
    assessCruxPerformance
} from './crux_integration.js';

import fs from 'fs-extra';
import path from 'path';

/**
 * Test runner with colored output
 */
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async run() {
        console.log('\n🧪 Running Azion PageSpeed Analyzer Tests (JavaScript)\n');
        
        for (const { name, testFn } of this.tests) {
            try {
                await testFn();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        }

        console.log(`\n📊 Test Results:`);
        console.log(`  • Passed: ${this.passed}`);
        console.log(`  • Failed: ${this.failed}`);
        console.log(`  • Total: ${this.tests.length}`);
        
        if (this.failed === 0) {
            console.log('\n🎉 All tests passed!');
        } else {
            console.log('\n⚠️ Some tests failed');
            process.exit(1);
        }
    }
}

const runner = new TestRunner();

// Test 1: Module imports
runner.test('Module imports work correctly', () => {
    if (!AZION_SOLUTIONS) throw new Error('AZION_SOLUTIONS not imported');
    if (!PAGESPEED_TO_AZION_MAPPING) throw new Error('PAGESPEED_TO_AZION_MAPPING not imported');
    if (typeof getAzionSolutionsForAudit !== 'function') throw new Error('getAzionSolutionsForAudit not imported');
    if (typeof generateMarketingCampaignData !== 'function') throw new Error('generateMarketingCampaignData not imported');
    if (typeof formatMarketingPitch !== 'function') throw new Error('formatMarketingPitch not imported');
});

// Test 2: Azion solutions data structure
runner.test('Azion solutions data structure is valid', () => {
    if (typeof AZION_SOLUTIONS !== 'object') throw new Error('AZION_SOLUTIONS is not an object');
    
    const requiredSolutions = ['applications', 'functions', 'cache', 'image_processor', 'firewall'];
    for (const solution of requiredSolutions) {
        if (!AZION_SOLUTIONS[solution]) throw new Error(`Missing solution: ${solution}`);
        if (!AZION_SOLUTIONS[solution].name) throw new Error(`Missing name for solution: ${solution}`);
        if (!AZION_SOLUTIONS[solution].description) throw new Error(`Missing description for solution: ${solution}`);
        if (!Array.isArray(AZION_SOLUTIONS[solution].features)) throw new Error(`Missing features array for solution: ${solution}`);
        if (!Array.isArray(AZION_SOLUTIONS[solution].benefits)) throw new Error(`Missing benefits array for solution: ${solution}`);
    }
});

// Test 3: PageSpeed to Azion mapping
runner.test('PageSpeed to Azion mapping is valid', () => {
    if (typeof PAGESPEED_TO_AZION_MAPPING !== 'object') throw new Error('PAGESPEED_TO_AZION_MAPPING is not an object');
    
    const testAudits = ['server-response-time', 'uses-webp-images', 'modern-image-formats', 'uses-text-compression'];
    for (const audit of testAudits) {
        if (!PAGESPEED_TO_AZION_MAPPING[audit]) throw new Error(`Missing mapping for audit: ${audit}`);
        if (!Array.isArray(PAGESPEED_TO_AZION_MAPPING[audit].solutions)) throw new Error(`Missing solutions array for audit: ${audit}`);
        if (!PAGESPEED_TO_AZION_MAPPING[audit].priority) throw new Error(`Missing priority for audit: ${audit}`);
        if (!PAGESPEED_TO_AZION_MAPPING[audit].description) throw new Error(`Missing description for audit: ${audit}`);
    }
});

// Test 4: Get Azion solutions function
runner.test('getAzionSolutionsForAudit function works', () => {
    const result = getAzionSolutionsForAudit('server-response-time');
    if (!result) throw new Error('No result returned');
    if (!result.solutions) throw new Error('No solutions in result');
    if (!Array.isArray(result.solutions)) throw new Error('Solutions is not an array');
    if (result.solutions.length === 0) throw new Error('No solutions found');
    if (!result.priority) throw new Error('No priority in result');
    if (!result.description) throw new Error('No description in result');
    
    // Test with invalid audit
    const invalidResult = getAzionSolutionsForAudit('invalid-audit-id');
    if (invalidResult !== null) throw new Error('Should return null for invalid audit');
});

// Test 5: Sample PageSpeed analysis data
runner.test('Marketing campaign data generation works', () => {
    const sampleAnalysis = {
        performance: {
            score: 65,
            issues: [
                {
                    id: 'server-response-time',
                    title: 'Reduce server response times (TTFB)',
                    description: 'Root document took 1,240 ms',
                    score: 0.3,
                    displayValue: '1,240 ms',
                    impact: 'high',
                    originalPagespeedData: {
                        description: 'Keep the server response time for the main document short because all other requests depend on it.',
                        numericValue: 1240,
                        numericUnit: 'millisecond'
                    }
                }
            ]
        },
        accessibility: {
            score: 85,
            issues: []
        },
        best_practices: {
            score: 92,
            issues: []
        },
        seo: {
            score: 78,
            issues: []
        }
    };
    
    const marketingData = generateMarketingCampaignData(sampleAnalysis);
    if (!marketingData) throw new Error('No marketing data generated');
    if (!marketingData.summary) throw new Error('No summary in marketing data');
    if (marketingData.summary.totalIssues !== 1) throw new Error('Incorrect total issues count');
    if (marketingData.summary.highPriorityIssues !== 1) throw new Error('Incorrect high priority issues count');
    if (!Array.isArray(marketingData.summary.potentialSolutions)) throw new Error('Potential solutions is not an array');
    if (!marketingData.actionPlan) throw new Error('No action plan generated');
    if (!Array.isArray(marketingData.actionPlan)) throw new Error('Action plan is not an array');
});

// Test 6: Marketing pitch formatting
runner.test('Marketing pitch formatting works', () => {
    const sampleCampaignData = {
        summary: {
            totalIssues: 5,
            highPriorityIssues: 2,
            potentialSolutions: ['cache', 'image_processor', 'applications']
        },
        solutionsOverview: {
            cache: AZION_SOLUTIONS.cache,
            image_processor: AZION_SOLUTIONS.image_processor
        }
    };
    
    const pitch = formatMarketingPitch(sampleCampaignData, 'https://example.com');
    if (!pitch) throw new Error('No pitch generated');
    if (!pitch.executiveSummary) throw new Error('No executive summary');
    if (!pitch.valueProposition) throw new Error('No value proposition');
    if (!pitch.solutionHighlights) throw new Error('No solution highlights');
    if (!Array.isArray(pitch.solutionHighlights)) throw new Error('Solution highlights is not an array');
    if (!pitch.nextSteps) throw new Error('No next steps');
    if (!Array.isArray(pitch.nextSteps)) throw new Error('Next steps is not an array');
});

// Test 7: CrUX integration functions exist
runner.test('CrUX integration functions are available', () => {
    if (typeof getCruxHistory !== 'function') throw new Error('getCruxHistory not available');
    if (typeof extractPagespeedCoreVitals !== 'function') throw new Error('extractPagespeedCoreVitals not available');
    if (typeof processCruxData !== 'function') throw new Error('processCruxData not available');
    if (typeof assessCruxPerformance !== 'function') throw new Error('assessCruxPerformance not available');
});

// Test 8: Environment setup
runner.test('Environment and dependencies are properly set up', async () => {
    // Check if reports directory can be created
    const testDir = './test_reports';
    await fs.ensureDir(testDir);
    const exists = await fs.pathExists(testDir);
    if (!exists) throw new Error('Cannot create directories');
    await fs.remove(testDir);
    
    // Check if we can write files
    const testFile = './test_file.tmp';
    await fs.writeFile(testFile, 'test content');
    const content = await fs.readFile(testFile, 'utf-8');
    if (content !== 'test content') throw new Error('Cannot write/read files');
    await fs.remove(testFile);
});

// Test 9: Data validation
runner.test('Data validation and error handling', () => {
    // Test with null/undefined inputs
    const nullResult = generateMarketingCampaignData(null);
    if (!nullResult || !nullResult.summary) throw new Error('Should handle null input gracefully');
    
    const emptyResult = generateMarketingCampaignData({});
    if (!emptyResult || !emptyResult.summary) throw new Error('Should handle empty input gracefully');
    
    // Test pitch formatting with minimal data
    const minimalPitch = formatMarketingPitch({ summary: { totalIssues: 0, highPriorityIssues: 0, potentialSolutions: [] }, solutionsOverview: {} }, 'https://test.com');
    if (!minimalPitch) throw new Error('Should handle minimal data gracefully');
});

// Test 10: Core functionality integration
runner.test('Core functionality integration test', () => {
    // Test the full pipeline with sample data
    const samplePageSpeedData = {
        lighthouseResult: {
            categories: {
                performance: { score: 0.65 },
                accessibility: { score: 0.85 },
                'best-practices': { score: 0.92 },
                seo: { score: 0.78 }
            },
            audits: {
                'server-response-time': {
                    score: 0.3,
                    title: 'Reduce server response times (TTFB)',
                    description: 'Root document took 1,240 ms',
                    displayValue: '1,240 ms',
                    numericValue: 1240,
                    numericUnit: 'millisecond'
                },
                'uses-webp-images': {
                    score: 0.4,
                    title: 'Serve images in next-gen formats',
                    description: 'Image formats like WebP and AVIF often provide better compression than PNG or JPEG',
                    displayValue: 'Potential savings of 45 KiB',
                    numericValue: 45000,
                    numericUnit: 'byte'
                }
            }
        }
    };
    
    // This would normally be done by analyzePagespeedData function
    const mockAnalysis = {
        performance: {
            score: 65,
            issues: [
                {
                    id: 'server-response-time',
                    title: 'Reduce server response times (TTFB)',
                    description: 'Root document took 1,240 ms',
                    score: 0.3,
                    displayValue: '1,240 ms',
                    impact: 'high'
                },
                {
                    id: 'uses-webp-images',
                    title: 'Serve images in next-gen formats',
                    description: 'Image formats like WebP and AVIF often provide better compression',
                    score: 0.4,
                    displayValue: 'Potential savings of 45 KiB',
                    impact: 'high'
                }
            ]
        }
    };
    
    const marketingData = generateMarketingCampaignData(mockAnalysis);
    if (marketingData.summary.totalIssues !== 2) throw new Error('Integration test failed: incorrect issue count');
    
    const pitch = formatMarketingPitch(marketingData, 'https://example.com');
    if (pitch.executiveSummary.issuesFound !== 2) throw new Error('Integration test failed: pitch data mismatch');
});

// Run all tests
runner.run().catch(console.error);
