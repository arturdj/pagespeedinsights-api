export const manualInterfaceStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0D0D0D; color: #FFFFFF; padding: 20px; line-height: 1.6;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header { 
        background: linear-gradient(135deg, #F3652B 0%, #FF8C42 100%);
        padding: 24px 30px; border-radius: 12px; margin-bottom: 24px; text-align: center;
    }
    .header h1 { font-size: 28px; margin-bottom: 8px; color: white; }
    .header p { font-size: 16px; opacity: 0.9; }
    .main-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
    }
    .form-section { 
        background: #1A1A1A; padding: 24px; border-radius: 12px; 
        border-left: 4px solid #F3652B;
    }
    .form-section h3 { color: #F3652B; margin-bottom: 16px; font-size: 18px; }
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
    }
    .form-row:first-child,
    .form-row:last-child {
        grid-template-columns: 1fr;
    }
    .form-group { margin-bottom: 0; }
    .form-group.checkbox-container {
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }
    .form-group label { 
        display: block; margin-bottom: 6px; color: #CCC; 
        font-weight: 500; font-size: 13px;
    }
    .form-group input, .form-group select { 
        width: 100%; padding: 10px 12px; border: 2px solid #333; 
        border-radius: 6px; background: #0D0D0D; color: #FFF;
        font-size: 13px; transition: border-color 0.2s;
    }
    .form-group input:focus, .form-group select:focus { 
        outline: none; border-color: #F3652B; 
    }
    .form-group small { color: #888; font-size: 12px; margin-top: 4px; display: block; }
    .checkbox-group { display: flex; align-items: center; gap: 10px; }
    .checkbox-group input[type="checkbox"] { width: auto; }
    .checkbox-group label { margin-bottom: 0; }
    .btn { 
        background: linear-gradient(135deg, #F3652B 0%, #FF8C42 100%);
        color: white; border: none; padding: 12px 24px; 
        border-radius: 6px; cursor: pointer; font-size: 14px;
        font-weight: 600; transition: transform 0.2s;
    }
    .btn-primary {
        width: 100%;
        padding: 14px 24px;
        font-size: 15px;
    }
    .btn:hover { transform: translateY(-2px); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .code-section { 
        background: #1A1A1A; padding: 24px; border-radius: 12px; 
        border-left: 4px solid #4285F4;
    }
    .code-section h3 { color: #4285F4; margin-bottom: 16px; font-size: 18px; }
    .code-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
    .code-tab { 
        padding: 6px 12px; background: #0D0D0D; border: 1px solid #333;
        border-radius: 4px; cursor: pointer; color: #CCC; font-size: 13px;
        transition: all 0.2s;
    }
    .code-tab.active { background: #4285F4; color: white; border-color: #4285F4; }
    .code-block { 
        background: #0D0D0D; padding: 16px; border-radius: 6px; 
        border: 1px solid #333; position: relative;
    }
    .code-block pre { 
        color: #E8EAED; font-family: 'Monaco', 'Courier New', monospace;
        font-size: 12px; line-height: 1.4; overflow-x: auto;
    }
    .copy-btn { 
        position: absolute; top: 10px; right: 10px;
        background: #333; color: #CCC; border: none; padding: 6px 12px;
        border-radius: 4px; cursor: pointer; font-size: 12px;
        transition: background 0.2s;
    }
    .copy-btn:hover { background: #555; }
    .progress-section { 
        background: #1A1A1A; padding: 24px; border-radius: 12px; 
        margin-bottom: 24px; border-left: 4px solid #34A853; display: none;
    }
    .progress-section.show { display: block; }
    .progress-section h4 { color: #34A853; margin-bottom: 15px; }
    .progress-bar { 
        width: 100%; height: 8px; background: #333; 
        border-radius: 4px; overflow: hidden; margin-bottom: 10px;
    }
    .progress-fill { 
        height: 100%; background: linear-gradient(90deg, #34A853 0%, #4CAF50 100%);
        transition: width 0.3s ease; width: 0%;
    }
    .progress-text { color: #CCC; font-size: 14px; }
    .progress-time { color: #888; font-size: 12px; }
    .log-view { 
        background: #0D0D0D; border: 1px solid #333; border-radius: 6px; 
        margin-top: 20px; max-height: 400px; overflow: hidden;
    }
    .log-header { 
        padding: 12px 16px; background: #1A1A1A; border-bottom: 1px solid #333;
        display: flex; justify-content: space-between; align-items: center;
    }
    .log-header h4 { color: #F3652B; font-size: 14px; margin: 0; }
    .log-toggle { 
        background: none; border: none; color: #F3652B; 
        cursor: pointer; font-size: 16px; padding: 4px;
    }
    .log-content { 
        max-height: 300px; overflow-y: auto; padding: 0;
        transition: max-height 0.3s ease;
    }
    .log-content.collapsed { max-height: 0; }
    .log-entry { 
        padding: 8px 16px; border-bottom: 1px solid #222;
        display: flex; align-items: flex-start; gap: 12px; font-size: 13px;
    }
    .log-entry:last-child { border-bottom: none; }
    .log-time { color: #888; min-width: 60px; font-family: monospace; }
    .log-level { 
        min-width: 60px; font-weight: 600; text-transform: uppercase;
        font-size: 11px; padding: 2px 6px; border-radius: 3px;
    }
    .log-level.info { background: #1E3A8A; color: #60A5FA; }
    .log-level.success { background: #166534; color: #4ADE80; }
    .log-level.warning { background: #92400E; color: #FBBF24; }
    .log-level.error { background: #991B1B; color: #F87171; }
    .log-message { flex: 1; color: #E5E7EB; }
    .log-details { color: #9CA3AF; font-size: 12px; margin-top: 2px; }
    .result-section { 
        background: #1A1A1A; padding: 24px; border-radius: 12px; 
        margin-bottom: 24px; border-left: 4px solid #34A853; display: none;
    }
    .result-section.show { display: block; }
    .result-section h3 { color: #34A853; margin-bottom: 20px; }
    .result-header { 
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #333;
    }
    .result-title { color: #34A853; font-size: 18px; margin: 0; }
    .result-time { color: #888; font-size: 14px; }
    .result-actions { display: flex; gap: 10px; }
    .result-actions .btn { padding: 8px 16px; font-size: 14px; }
    .summary-grid { 
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px; margin-bottom: 20px;
    }
    .summary-card { 
        background: #0D0D0D; padding: 20px; border-radius: 8px; 
        text-align: center; border: 1px solid #333;
    }
    .summary-number { font-size: 24px; font-weight: bold; color: #F3652B; }
    .summary-label { color: #CCC; font-size: 12px; margin-top: 5px; }
    .result-content { 
        background: #0D0D0D; padding: 20px; border-radius: 6px; 
        border: 1px solid #333; max-height: 500px; overflow-y: auto;
    }
    .result-content pre { 
        color: #E8EAED; font-family: 'Monaco', 'Courier New', monospace;
        font-size: 12px; line-height: 1.4; white-space: pre-wrap;
    }
    .error-section { 
        background: #1A1A1A; padding: 24px; border-radius: 12px; 
        margin-bottom: 24px; border-left: 4px solid #EA4335; display: none;
    }
    .error-section.show { display: block; }
    .error-section h3 { color: #EA4335; margin-bottom: 15px; }
    .error-message { 
        background: #2D1B1B; padding: 15px; border-radius: 6px; 
        border-left: 3px solid #EA4335; color: #F87171;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
        .main-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        .container {
            max-width: 100%;
            padding: 0 16px;
        }
        body {
            padding: 16px;
        }
    }

    @media (max-width: 768px) {
        .header {
            padding: 20px 24px;
        }
        .header h1 {
            font-size: 24px;
        }
        .header p {
            font-size: 14px;
        }
        .form-section, .code-section {
            padding: 20px;
        }
        .form-row {
            grid-template-columns: 1fr;
            gap: 12px;
            margin-bottom: 12px;
        }
        .form-row:first-child,
        .form-row:last-child {
            grid-template-columns: 1fr;
        }
        .code-tabs {
            flex-wrap: wrap;
            gap: 6px;
        }
        .code-tab {
            padding: 8px 12px;
            font-size: 12px;
        }
        .code-block {
            padding: 12px;
        }
        .code-block pre {
            font-size: 11px;
        }
        .summary-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
    }

    @media (max-width: 480px) {
        body {
            padding: 12px;
        }
        .header {
            padding: 16px 20px;
        }
        .header h1 {
            font-size: 20px;
        }
        .form-section, .code-section, .progress-section, .result-section, .error-section {
            padding: 16px;
        }
        .summary-grid {
            grid-template-columns: 1fr;
        }
        .result-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }
        .result-actions {
            width: 100%;
            justify-content: stretch;
        }
        .result-actions .btn {
            flex: 1;
        }
    }

    /* Solutions Display Styles */
    .solutions-overview {
        margin-bottom: 24px;
    }
    .solutions-section {
        background: #1A1A1A;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 16px;
    }
    .solutions-section h4 {
        color: #F3652B;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
    }
    .performance-scores {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
    }
    .score-item {
        background: #0D0D0D;
        padding: 12px;
        border-radius: 6px;
        text-align: center;
        border: 1px solid #333;
    }
    .score-label {
        display: block;
        font-size: 12px;
        color: #CCC;
        margin-bottom: 4px;
    }
    .score-value {
        font-size: 18px;
        font-weight: bold;
        color: #F3652B;
    }
    .quick-wins {
        display: grid;
        gap: 12px;
    }
    .quick-win-item {
        background: #0D0D0D;
        padding: 16px;
        border-radius: 6px;
        border-left: 3px solid #28a745;
    }
    .quick-win-item strong {
        color: #28a745;
        display: block;
        margin-bottom: 8px;
    }
    .quick-win-item p {
        margin-bottom: 8px;
        color: #CCC;
    }
    .quick-win-item small {
        display: block;
        color: #999;
        margin-bottom: 4px;
    }
    .recommended-products {
        display: grid;
        gap: 16px;
    }
    .product-item {
        background: #0D0D0D;
        padding: 16px;
        border-radius: 6px;
        border-left: 3px solid #F3652B;
    }
    .product-item h5 {
        color: #F3652B;
        margin-bottom: 8px;
        font-size: 14px;
    }
    .product-item p {
        color: #CCC;
        margin-bottom: 12px;
        font-size: 13px;
    }
    .product-benefits {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }
    .benefit-tag {
        background: #333;
        color: #FFF;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
    }
    .next-steps {
        background: #0D0D0D;
        padding: 16px;
        border-radius: 6px;
        border-left: 3px solid #17a2b8;
    }
    .action-item {
        color: #CCC;
        margin-bottom: 8px;
        padding-left: 8px;
    }
    .consultation-rec {
        background: #1A1A1A;
        padding: 12px;
        border-radius: 6px;
        margin-top: 12px;
        border-left: 3px solid #ffc107;
    }
    .consultation-rec strong {
        color: #ffc107;
    }
    .json-data-section {
        margin-top: 24px;
        background: #1A1A1A;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 20px;
    }
    .json-data-section h4 {
        color: #F3652B;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
    }
    .json-response {
        background: #0D0D0D;
        color: #E0E0E0;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 16px;
        font-size: 12px;
        line-height: 1.4;
        overflow-x: auto;
        max-height: 400px;
        overflow-y: auto;
    }

    /* JSON Syntax Highlighting */
    .json-container {
        background: #0D0D0D;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 16px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        line-height: 1.5;
        overflow-x: auto;
        max-height: 500px;
        overflow-y: auto;
        white-space: pre;
        word-wrap: normal;
        text-align: left;
    }
    
    .json-key {
        color: #79C0FF;
        font-weight: 500;
    }
    
    .json-string {
        color: #A5D6FF;
    }
    
    .json-number {
        color: #79C0FF;
    }
    
    .json-boolean {
        color: #FF7B72;
    }
    
    .json-null {
        color: #FF7B72;
    }
    
    .json-punctuation {
        color: #E6EDF3;
    }
    
    .json-brace {
        color: #FFA657;
        font-weight: bold;
    }
    
    .json-bracket {
        color: #FFA657;
        font-weight: bold;
    }
`;
