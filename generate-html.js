const fs = require('fs');

const REPORT_FILE = 'accessibility-report.json';
const OUTPUT_FILE = 'accessibility-report.html';

// 1. Load Data
let rawData = { metadata: {}, violations: [] };
try {
  if (fs.existsSync(REPORT_FILE)) {
    const fileContent = fs.readFileSync(REPORT_FILE, 'utf8');
    const json = JSON.parse(fileContent);
    // Handle both new object format and legacy array format safely
    if (Array.isArray(json)) {
      rawData.violations = json;
    } else {
      rawData = json;
    }
  }
} catch (e) {
  console.error("Error reading report:", e);
}

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report</title>
  <style>
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #334155;
      --heading: #0f172a;
      --border: #e2e8f0;
      --primary: #2563eb;
      --error: #ef4444;
      --success: #22c55e;
      --chip-bg: #f1f5f9;
      --chip-text: #475569;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 2rem;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    /* HEADER & METADATA */
    header {
      background: var(--surface);
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    h1 { margin: 0 0 1.5rem 0; color: var(--heading); font-size: 1.8rem; }
    
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      border-top: 1px solid var(--border);
      padding-top: 1.5rem;
    }
    .meta-item { display: flex; flex-direction: column; }
    .meta-label { font-size: 0.85rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta-value { font-size: 1rem; font-weight: 500; color: var(--heading); word-break: break-all; }
    
    /* STATUS BANNER */
    .status-banner {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      font-size: 1.1rem;
    }
    .status-fail { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .status-pass { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }

    /* FILE CARDS */
    .file-card {
      background: var(--surface);
      border-radius: 12px;
      border: 1px solid var(--border);
      margin-bottom: 1.5rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .file-header {
      background: #f8fafc;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .filename { font-family: monospace; font-weight: 600; color: var(--primary); font-size: 0.95rem; }
    .count-badge { background: var(--error); color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }

    /* ISSUES */
    .issue {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      gap: 1.5rem;
    }
    .issue:last-child { border-bottom: none; }
    
    .line-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 4rem;
      height: 4rem;
      background: #eff6ff;
      color: var(--primary);
      border-radius: 8px;
      font-family: monospace;
      font-weight: bold;
      border: 1px solid #dbeafe;
    }
    .line-label { font-size: 0.7rem; text-transform: uppercase; opacity: 0.8; }
    .line-val { font-size: 1.2rem; }

    .content { flex: 1; }
    .message { font-size: 1.05rem; font-weight: 500; color: var(--heading); margin-bottom: 0.75rem; }
    
    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .tag {
      font-size: 0.75rem;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
      border: 1px solid transparent;
    }
    .tag-wcag { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }
    .tag-framework { background: #e0e7ff; color: #4338ca; border-color: #c7d2fe; }
    .tag-rule { font-family: monospace; background: #fff; border: 1px solid #e2e8f0; color: #64748b; }

  </style>
</head>
<body>
  <div class="container" id="app"></div>

  <script>
    // INJECTED DATA
    const DATA = {{DATA_PLACEHOLDER}};
    const app = document.getElementById('app');

    const meta = DATA.metadata || {};
    const violations = DATA.violations || [];
    
    const totalFiles = violations.length;
    const totalIssues = violations.reduce((acc, f) => acc + f.messages.length, 0);
    const isSuccess = totalIssues === 0;

    // RENDER HEADER
    let html = \`
      <header>
        <h1>Accessibility Audit Report</h1>
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Repository</span>
            <span class="meta-value">\${meta.repositoryUrl || 'Local Scan'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Branch</span>
            <span class="meta-value">\${meta.branch || 'HEAD'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Scan Date</span>
            <span class="meta-value">\${meta.scanDate || new Date().toLocaleString()}</span>
          </div>
        </div>
        
        <div class="status-banner \${isSuccess ? 'status-pass' : 'status-fail'}">
          \${isSuccess 
            ? '✅ PASSED: No accessibility violations found.' 
            : \`❌ FAILED: Found \${totalIssues} violations in \${totalFiles} files.\`}
        </div>
      </header>
    \`;

    // RENDER VIOLATIONS
    if (totalFiles === 0 && !isSuccess) {
      html += '<div style="text-align:center; padding:3rem; color:#64748b">No scannable files found or scanner failed to run.</div>';
    } else {
      violations.forEach(file => {
        html += \`
          <div class="file-card">
            <div class="file-header">
              <span class="filename">\${file.filePath}</span>
              <span class="count-badge">\${file.messages.length}</span>
            </div>
            \`;
            
        file.messages.forEach(msg => {
          html += \`
            <div class="issue">
              <div class="line-box">
                <span class="line-label">Line</span>
                <span class="line-val">\${msg.line}</span>
              </div>
              <div class="content">
                <div class="message">\${msg.message}</div>
                <div class="tags">
                  <span class="tag tag-framework">\${msg.framework || 'General'}</span>
                  <span class="tag tag-wcag">\${msg.wcagClause || 'Best Practice'}</span>
                  <span class="tag tag-rule">\${msg.ruleId}</span>
                </div>
              </div>
            </div>
          \`;
        });
        
        html += \`</div>\`;
      });
    }

    app.innerHTML = html;
  </script>
</body>
</html>
`;

// Inject Data and Write File
const finalHtml = htmlTemplate.replace('{{DATA_PLACEHOLDER}}', JSON.stringify(rawData));
fs.writeFileSync(OUTPUT_FILE, finalHtml);
console.log(`✅ HTML Report generated: \${OUTPUT_FILE}`);
