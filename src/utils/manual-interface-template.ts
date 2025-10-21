import { manualInterfaceStyles } from './manual-interface-styles.js';

export function generateManualInterfaceHTML(baseUrl: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azion PageSpeed Analyzer - Manual Interface</title>
    <style>${manualInterfaceStyles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Azion PageSpeed Analyzer</h1>
            <p>Comprehensive Manual Testing Interface</p>
        </div>

        <div class="main-grid">
            <div class="form-section">
                <h3>Configuration</h3>
                <form id="analysisForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="url">Website URL *</label>
                            <input type="url" id="url" name="url" required placeholder="https://example.com" value="https://www.azion.com">
                            <small>https:// added automatically if needed</small>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="device">Device</label>
                            <select id="device" name="device">
                                <option value="mobile" selected>Mobile</option>
                                <option value="desktop">Desktop</option>
                                <option value="tablet">Tablet</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="outputType">Output Type</label>
                            <select id="outputType" name="outputType">
                                <option value="json" selected>JSON Analysis</option>
                                <option value="html">HTML Report</option>
                                <option value="full">Full JSON + HTML</option>
                                <option value="solutions">Azion Solutions & Insights</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group checkbox-container">
                            <div class="checkbox-group">
                                <input type="checkbox" id="useCrux" name="useCrux">
                                <label for="useCrux">Include CrUX History Data</label>
                            </div>
                        </div>

                        <div class="form-group checkbox-container">
                            <div class="checkbox-group">
                                <input type="checkbox" id="followRedirects" name="followRedirects">
                                <label for="followRedirects">Follow URL Redirects</label>
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <button type="submit" class="btn btn-primary" id="analyzeBtn">🚀 Execute Request</button>
                    </div>
                </form>
            </div>

            <div class="code-section">
                <h3>Request Formats</h3>
                <div class="code-tabs">
                    <div class="code-tab active" data-tab="curl">cURL</div>
                    <div class="code-tab" data-tab="javascript">JavaScript</div>
                    <div class="code-tab" data-tab="python">Python</div>
                </div>
                <div class="code-block">
                    <button class="copy-btn" onclick="copyCode()">Copy</button>
                    <pre id="codeExample"></pre>
                </div>
            </div>
        </div>

        <div class="progress-section" id="progressSection">
            <h4 id="progressTitle">🔄 Analyzing performance...</h4>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text" id="progressText">Initializing...</div>
            <div class="progress-time" id="progressTime">Elapsed: 0s / Est. 120s</div>
            
            <div class="log-view" id="logView">
                <div class="log-header">
                    <h4>📋 Processing Log</h4>
                    <button class="log-toggle" id="logToggle" onclick="toggleLogView()">▶</button>
                </div>
                <div class="log-content collapsed" id="logContent"></div>
            </div>
        </div>

        <div class="result-section" id="resultSection">
            <h3 id="resultTitle">✅ Analysis Complete</h3>
            <div class="result-header" id="resultHeader"></div>
            <div class="summary-grid" id="summaryGrid" style="display: none;"></div>
            <div class="result-content" id="resultContent"></div>
        </div>

        <div class="error-section" id="errorSection">
            <h3>❌ Analysis Failed</h3>
            <div class="error-message" id="errorMessage"></div>
        </div>
    </div>

    <script>
        const baseUrl = '${baseUrl}';
        // JavaScript functions will be injected here
        ${generateManualInterfaceJS()}
    </script>
</body>
</html>`;
}

function generateManualInterfaceJS(): string {
  return `
        let analysisStartTime = null;
        let progressSteps = [];
        let currentStep = 0;
        let stepStartTime = null;
        let averageStepTime = 0;
        const API_TIMEOUT = 120; // 120 seconds timeout
        let progressInterval = null;

        // Initialize the interface
        document.addEventListener('DOMContentLoaded', function() {
            updateCodeExample();
            
            // Add event listeners for form changes
            document.getElementById('url').addEventListener('input', updateCodeExample);
            document.getElementById('device').addEventListener('change', updateCodeExample);
            document.getElementById('outputType').addEventListener('change', updateCodeExample);
            document.getElementById('useCrux').addEventListener('change', updateCodeExample);
            document.getElementById('followRedirects').addEventListener('change', updateCodeExample);
            
            // Add event listeners for code tabs
            document.querySelectorAll('.code-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    updateCodeExample();
                });
            });
            
            // Form submission
            document.getElementById('analysisForm').addEventListener('submit', performAnalysis);
        });

        function getCurrentRequestData() {
            const form = document.getElementById('analysisForm');
            const formData = new FormData(form);
            
            return {
                url: formData.get('url'),
                device: formData.get('device'),
                use_crux: document.getElementById('useCrux').checked,
                weeks: 25,
                follow_redirects: document.getElementById('followRedirects').checked
            };
        }

        function updateCodeExample() {
            const activeTab = document.querySelector('.code-tab.active').dataset.tab;
            const data = getCurrentRequestData();
            const outputType = document.getElementById('outputType').value;
            
            let endpoint = baseUrl + '/analyze';
            if (outputType === 'html') endpoint = baseUrl + '/report';
            else if (outputType === 'full') endpoint = baseUrl + '/full';
            else if (outputType === 'solutions') endpoint = baseUrl + '/solutions';
            
            let code = '';
            
            if (activeTab === 'curl') {
                code = \`curl -X POST \\\\
  -H "Content-Type: application/json" \\\\
  -d '{
  "url": "\${data.url}",
  "device": "\${data.device}",
  "use_crux": \${data.use_crux},
  "weeks": \${data.weeks},
  "follow_redirects": \${data.follow_redirects}
}' \\\\
  \${endpoint}\`;
            } else if (activeTab === 'javascript') {
                code = \`const response = await fetch('\${endpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: '\${data.url}',
    device: '\${data.device}',
    use_crux: \${data.use_crux},
    weeks: \${data.weeks},
    follow_redirects: \${data.follow_redirects}
  })
});

const result = await response.json();
console.log(result);\`;
            } else if (activeTab === 'python') {
                code = \`import requests
import json

url = '\${endpoint}'
data = {
    'url': '\${data.url}',
    'device': '\${data.device}',
    'use_crux': \${data.use_crux},
    'weeks': \${data.weeks},
    'follow_redirects': \${data.follow_redirects}
}

response = requests.post(url, json=data)
result = response.json()
print(json.dumps(result, indent=2))\`;
            }
            
            document.getElementById('codeExample').textContent = code;
        }

        function copyCode() {
            const code = document.getElementById('codeExample').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        }

        function initializeProgressSteps(data) {
            progressSteps = [
                'Validating request parameters',
                'Preparing analysis configuration'
            ];
            
            if (data.follow_redirects) {
                progressSteps.push('Following URL redirects');
            }
            
            progressSteps.push(
                'Calling PageSpeed Insights API',
                'Processing PageSpeed data',
                'Analyzing performance metrics'
            );
            
            if (data.use_crux) {
                progressSteps.push(
                    'Fetching CrUX history data',
                    'Processing CrUX metrics'
                );
            }
            
            progressSteps.push(
                'Generating Azion recommendations',
                'Creating HTML report',
                'Finalizing response'
            );
            
            currentStep = 0;
        }

        function updateProgress(step, total, message) {
            const stepPercentage = (step / total) * 100;
            
            if (analysisStartTime) {
                const elapsed = Math.max(1, Math.floor((Date.now() - analysisStartTime) / 1000));
                
                // Calculate time-based progress (0-30% of total progress)
                const timeProgress = Math.min((elapsed / API_TIMEOUT) * 30, 30);
                
                // Combine step progress (70%) with time progress (30%)
                const combinedPercentage = Math.min((stepPercentage * 0.7) + timeProgress, 100);
                
                document.getElementById('progressFill').style.width = combinedPercentage + '%';
                document.getElementById('progressText').textContent = message;
                
                // Calculate realistic estimate based on current progress and timeout
                let estimated = API_TIMEOUT;
                if (step > 1 && elapsed > 0) {
                    averageStepTime = elapsed / step;
                    const remainingSteps = total - step;
                    const stepBasedEstimate = elapsed + (remainingSteps * averageStepTime);
                    
                    // Use the minimum of step-based estimate and timeout
                    estimated = Math.min(stepBasedEstimate, API_TIMEOUT);
                    
                    // Ensure estimate is always greater than elapsed time
                    estimated = Math.max(estimated, elapsed + 5);
                }
                
                document.getElementById('progressTime').textContent = \`Elapsed: \${elapsed}s / Est. \${Math.ceil(estimated)}s (Timeout: \${API_TIMEOUT}s)\`;
            } else {
                // Fallback if no start time
                document.getElementById('progressFill').style.width = stepPercentage + '%';
                document.getElementById('progressText').textContent = message;
            }
        }

        function addLogEntry(level, message, details = '') {
            const logContent = document.getElementById('logContent');
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            
            entry.innerHTML = \`
                <div class="log-time">\${time}</div>
                <div class="log-level \${level}">\${level.toUpperCase()}</div>
                <div class="log-message">
                    \${message}
                    \${details ? \`<div class="log-details">\${details}</div>\` : ''}
                </div>
            \`;
            
            logContent.appendChild(entry);
            logContent.scrollTop = logContent.scrollHeight;
        }

        function clearLog() {
            document.getElementById('logContent').innerHTML = '';
        }

        function toggleLogView() {
            const logContent = document.getElementById('logContent');
            const logToggle = document.getElementById('logToggle');
            
            if (logContent.classList.contains('collapsed')) {
                logContent.classList.remove('collapsed');
                logToggle.textContent = '▼';
            } else {
                logContent.classList.add('collapsed');
                logToggle.textContent = '▶';
            }
        }

        function syntaxHighlightJSON(json) {
            if (typeof json !== 'string') {
                json = JSON.stringify(json, null, 2);
            }
            
            // First escape HTML entities to prevent parsing issues
            json = json
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            
            // Apply syntax highlighting to the escaped content
            return json.replace(/(&quot;(?:[^&\\\\]|\\\\.|&[^;]*;)*&quot;(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                let cls = 'json-number';
                if (/^&quot;/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            })
            .replace(/([{}])/g, '<span class="json-brace">$1</span>')
            .replace(/([\\[\\]])/g, '<span class="json-bracket">$1</span>')
            .replace(/([,:])/g, '<span class="json-punctuation">$1</span>');
        }

        function createResultsHeader(elapsedTime) {
            return \`
                <div class="result-title">Analysis Complete</div>
                <div class="result-time">Completed in \${elapsedTime}s</div>
                <div class="result-actions">
                    <button class="btn" onclick="copyResult()">Copy</button>
                    <button class="btn" onclick="downloadResult()">Download</button>
                </div>
            \`;
        }

        function createSummaryGrid(data) {
            if (!data.analysis) return '';
            
            const analysis = data.analysis;
            const categories = Object.keys(analysis);
            const totalIssues = categories.reduce((sum, cat) => sum + (analysis[cat].issues?.length || 0), 0);
            const avgScore = categories.reduce((sum, cat) => sum + (analysis[cat].score || 0), 0) / categories.length;
            
            return \`
                <div class="summary-card">
                    <div class="summary-number">\${Math.round(avgScore)}</div>
                    <div class="summary-label">Overall Score</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">\${totalIssues}</div>
                    <div class="summary-label">Issues Found</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">\${categories.length}</div>
                    <div class="summary-label">Categories</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number">\${data.azion_recommendations?.solution_count || 0}</div>
                    <div class="summary-label">Solutions</div>
                </div>
            \`;
        }

        async function performAnalysis(event) {
            event.preventDefault();
            
            const data = getCurrentRequestData();
            const outputType = document.getElementById('outputType').value;
            
            let endpoint = baseUrl + '/analyze';
            if (outputType === 'html') endpoint = baseUrl + '/report';
            else if (outputType === 'full') endpoint = baseUrl + '/full';
            else if (outputType === 'solutions') endpoint = baseUrl + '/solutions';
            
            // Show progress section
            const progress = document.getElementById('progressSection');
            const result = document.getElementById('resultSection');
            const error = document.getElementById('errorSection');
            const loading = document.getElementById('progressSection');
            
            // Reset UI
            error.classList.remove('show');
            result.classList.remove('show');
            loading.classList.add('show');
            clearLog();
            
            // Initialize log as collapsed
            const logContent = document.getElementById('logContent');
            const logToggle = document.getElementById('logToggle');
            logContent.classList.add('collapsed');
            logToggle.textContent = '▶';
            
            // Initialize progress tracking
            analysisStartTime = Date.now();
            initializeProgressSteps(data);
            
            // Start continuous time updates
            progressInterval = setInterval(() => {
                if (analysisStartTime && currentStep > 0) {
                    updateProgress(currentStep, progressSteps.length, progressSteps[currentStep - 1] || 'Processing...');
                }
            }, 1000);
            
            // Start logging
            addLogEntry('info', 'Analysis started', 'Endpoint: ' + endpoint);
            addLogEntry('info', 'Request configuration', JSON.stringify(data, null, 2));
            
            const isReport = outputType === 'html';
            const isFull = outputType === 'full';
            const isSolutions = outputType === 'solutions';
            
            try {
                // Step 1: Validate request
                stepStartTime = Date.now();
                updateProgress(++currentStep, progressSteps.length, progressSteps[currentStep - 1]);
                addLogEntry('info', progressSteps[currentStep - 1]);
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Step 2: Prepare configuration
                updateProgress(++currentStep, progressSteps.length, progressSteps[currentStep - 1]);
                addLogEntry('info', progressSteps[currentStep - 1]);
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Step 3: Handle redirects if enabled
                if (data.follow_redirects) {
                    updateProgress(++currentStep, progressSteps.length, progressSteps[currentStep - 1]);
                    addLogEntry('info', progressSteps[currentStep - 1]);
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                // Step 4: Call API
                updateProgress(++currentStep, progressSteps.length, progressSteps[currentStep - 1]);
                addLogEntry('info', progressSteps[currentStep - 1], 'Making request to: ' + endpoint);
                
                const requestStart = Date.now();
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const requestTime = Date.now() - requestStart;
                addLogEntry('success', 'API request completed', \`Response time: \${requestTime}ms, Status: \${response.status}\`);
                
                // Step 5: Process response
                updateProgress(++currentStep, progressSteps.length, progressSteps[currentStep - 1]);
                addLogEntry('info', progressSteps[currentStep - 1]);
                
                if (isReport) {
                    if (response.ok) {
                        const htmlContent = await response.text();
                        addLogEntry('success', 'HTML report generated', \`Size: \${(htmlContent.length / 1024).toFixed(1)} KB\`);
                        
                        // Complete remaining steps quickly
                        while (currentStep < progressSteps.length) {
                            updateProgress(++currentStep, progressSteps.length, progressSteps[currentStep - 1]);
                            addLogEntry('info', progressSteps[currentStep - 1]);
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                        
                        displayHtmlReportResult(htmlContent, data);
                    } else {
                        const errorData = await response.text();
                        addLogEntry('error', 'Report generation failed', 'Status: ' + response.status);
                        throw new Error('Failed to generate report: ' + errorData);
                    }
                    return;
                }
                
                const responseData = await response.json();
                
                if (!response.ok) {
                    addLogEntry('error', 'API request failed', \`Status: \${response.status}, Message: \${responseData.message || 'Unknown error'}\`);
                    throw new Error(responseData.message || 'Analysis failed');
                }
                
                addLogEntry('success', 'Response data received', \`Size: \${JSON.stringify(responseData).length} bytes\`);
                
                // Log redirected URL if available
                if (responseData.final_url && responseData.final_url !== data.url) {
                    addLogEntry('success', 'Following URL redirects', \`Original URL: \${data.url} -> \${responseData.final_url}\`);
                } else if (responseData.final_url) {
                    addLogEntry('info', 'Final URL confirmed', \`URL: \${responseData.final_url}\`);
                }
                
                // Complete remaining steps
                while (currentStep < progressSteps.length) {
                    updateProgress(++currentStep, progressSteps.length, progressSteps[currentStep - 1]);
                    addLogEntry('info', progressSteps[currentStep - 1]);
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                
                const analysisElapsedTime = Math.floor((Date.now() - analysisStartTime) / 1000);
                addLogEntry('success', 'Analysis completed successfully', \`Total time: \${analysisElapsedTime}s\`);
                
                if (isFull) {
                    displayFullAnalysisResult(responseData, analysisElapsedTime);
                } else if (isSolutions) {
                    displaySolutionsResult(responseData, analysisElapsedTime);
                } else {
                    displayResults(responseData, analysisElapsedTime);
                }
                
            } catch (error) {
                addLogEntry('error', 'Analysis failed', error.message);
                showError(error.message);
            } finally {
                // Clear the progress interval
                if (progressInterval) {
                    clearInterval(progressInterval);
                    progressInterval = null;
                }
            }
        }

        function displayResults(data, elapsedTime) {
            const resultSection = document.getElementById('resultSection');
            const resultHeader = document.getElementById('resultHeader');
            const resultContent = document.getElementById('resultContent');
            const summaryGrid = document.getElementById('summaryGrid');
            
            // Set header
            resultHeader.innerHTML = createResultsHeader(elapsedTime);
            
            // Set summary
            summaryGrid.innerHTML = createSummaryGrid(data);
            summaryGrid.style.display = 'grid';
            
            // Set content with syntax highlighting
            resultContent.innerHTML = \`<div class="json-container">\${syntaxHighlightJSON(data)}</div>\`;
            
            resultSection.classList.add('show');
            window.currentResult = data;
        }

        function displayFullAnalysisResult(data, elapsedTime) {
            displayResults(data, elapsedTime);
        }


        function displaySolutionsResult(data, elapsedTime) {
            const resultSection = document.getElementById('resultSection');
            const resultHeader = document.getElementById('resultHeader');
            const resultContent = document.getElementById('resultContent');
            const summaryGrid = document.getElementById('summaryGrid');
            
            // Set header with elapsed time
            resultHeader.innerHTML = createResultsHeader(elapsedTime);
            
            // Create summary grid for Solutions format
            const metadata = data.metadata || {};
            const performanceAssessment = data.performance_assessment || {};
            const azionSolutions = data.azion_solutions || {};
            const optimizationInsights = data.optimization_insights || {};
            
            summaryGrid.innerHTML = \`
                <div class="summary-item">
                    <div class="summary-value">\${metadata.overall_performance_score || 0}</div>
                    <div class="summary-label">Performance Score</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">\${metadata.total_issues_detected || 0}</div>
                    <div class="summary-label">Issues Found</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">\${azionSolutions.summary?.total_applicable_solutions || 0}</div>
                    <div class="summary-label">Azion Solutions</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">\${optimizationInsights.quick_wins?.length || 0}</div>
                    <div class="summary-label">Quick Wins</div>
                </div>
            \`;
            
            // Create structured display for Solutions data
            const solutionsHtml = \`
                <div class="solutions-overview">
                    <div class="solutions-section">
                        <h4>🎯 Performance Assessment</h4>
                        <div class="performance-scores">
                            <div class="score-item">
                                <span class="score-label">Performance:</span>
                                <span class="score-value">\${Math.round((performanceAssessment.scores_by_category?.performance || 0) * 100)}</span>
                            </div>
                            <div class="score-item">
                                <span class="score-label">Accessibility:</span>
                                <span class="score-value">\${Math.round((performanceAssessment.scores_by_category?.accessibility || 0) * 100)}</span>
                            </div>
                            <div class="score-item">
                                <span class="score-label">Best Practices:</span>
                                <span class="score-value">\${Math.round((performanceAssessment.scores_by_category?.best_practices || 0) * 100)}</span>
                            </div>
                            <div class="score-item">
                                <span class="score-label">SEO:</span>
                                <span class="score-value">\${Math.round((performanceAssessment.scores_by_category?.seo || 0) * 100)}</span>
                            </div>
                        </div>
                    </div>
                    
                    \${optimizationInsights.quick_wins?.length > 0 ? \`
                    <div class="solutions-section">
                        <h4>⚡ Quick Wins</h4>
                        <div class="quick-wins">
                            \${optimizationInsights.quick_wins.map(win => \`
                                <div class="quick-win-item">
                                    <strong>\${win.title}</strong>
                                    <p>\${win.description}</p>
                                    <small>💡 Solution: \${win.azion_solution}</small>
                                    \${win.estimated_savings ? \`<small>💰 Savings: \${win.estimated_savings}</small>\` : ''}
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                    \` : ''}
                    
                    \${azionSolutions.recommended_products?.length > 0 ? \`
                    <div class="solutions-section">
                        <h4>🚀 Recommended Azion Products</h4>
                        <div class="recommended-products">
                            \${azionSolutions.recommended_products.slice(0, 3).map(product => \`
                                <div class="product-item">
                                    <h5>\${product.name}</h5>
                                    <p>\${product.description}</p>
                                    <div class="product-benefits">
                                        \${product.business_benefits?.slice(0, 3).map(benefit => \`<span class="benefit-tag">\${benefit}</span>\`).join('') || ''}
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                    \` : ''}
                    
                    <div class="solutions-section">
                        <h4>📋 Next Steps</h4>
                        <div class="next-steps">
                            \${data.next_steps?.immediate_actions?.map(action => \`
                                <div class="action-item">• \${action}</div>
                            \`).join('') || ''}
                            \${data.next_steps?.consultation_recommendation ? \`
                                <div class="consultation-rec">
                                    <strong>💡 Recommendation:</strong> \${data.next_steps.consultation_recommendation}
                                </div>
                            \` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="json-data-section">
                    <h4>📄 Complete JSON Response</h4>
                    <div class="json-container">\${syntaxHighlightJSON(data)}</div>
                </div>
            \`;
            
            // Display the solutions content
            resultContent.innerHTML = solutionsHtml;
            
            // Show the result section
            resultSection.classList.add('show');
            
            // Store original data for copy/download functions
            window.currentResult = data;
        }

        function displayHtmlReportResult(htmlContent, requestData) {
            const resultSection = document.getElementById('resultSection');
            const resultHeader = document.getElementById('resultHeader');
            const resultContent = document.getElementById('resultContent');
            const summaryGrid = document.getElementById('summaryGrid');
            
            const analysisElapsedTime = Math.floor((Date.now() - analysisStartTime) / 1000);
            
            // Set header
            resultHeader.innerHTML = createResultsHeader(analysisElapsedTime);
            
            // Hide summary for HTML reports
            summaryGrid.style.display = 'none';
            
            // Create iframe for HTML content
            resultContent.innerHTML = \`
                <iframe 
                    srcdoc="\${htmlContent.replace(/"/g, '&quot;')}" 
                    style="width: 100%; height: 600px; border: 1px solid #333; border-radius: 6px;"
                    sandbox="allow-same-origin allow-scripts">
                </iframe>
            \`;
            
            resultSection.classList.add('show');
            window.currentResult = htmlContent;
        }

        function showError(message) {
            const errorSection = document.getElementById('errorSection');
            const errorMessage = document.getElementById('errorMessage');
            
            errorMessage.textContent = message;
            errorSection.classList.add('show');
        }

        function copyResult() {
            if (window.currentResult) {
                const content = typeof window.currentResult === 'string' 
                    ? window.currentResult 
                    : JSON.stringify(window.currentResult, null, 2);
                
                navigator.clipboard.writeText(content).then(() => {
                    const btn = event.target;
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 2000);
                });
            }
        }

        function downloadResult() {
            if (window.currentResult) {
                const content = typeof window.currentResult === 'string' 
                    ? window.currentResult 
                    : JSON.stringify(window.currentResult, null, 2);
                
                const outputType = document.getElementById('outputType').value;
                const url = document.getElementById('url').value;
                const domain = new URL(url).hostname;
                
                let filename, mimeType;
                if (outputType === 'html' || typeof window.currentResult === 'string') {
                    filename = \`azion-report-\${domain}-\${Date.now()}.html\`;
                    mimeType = 'text/html';
                } else {
                    filename = \`azion-analysis-\${domain}-\${Date.now()}.json\`;
                    mimeType = 'application/json';
                }
                
                const blob = new Blob([content], { type: mimeType });
                const url2 = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url2;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url2);
            }
        }
  `;
}
