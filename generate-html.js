const fs = require('fs');

const REPORT_FILE = 'accessibility-report.json';
const OUTPUT_FILE = 'accessibility-report.html';

let reportData = [];
try {
  if (fs.existsSync(REPORT_FILE)) {
    reportData = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
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
  <title>Accessibility Report</title>
  <style>
    /* CSS STYLES - Kept minimal for brevity */
    :root { --bg: #f8fafc; --surface: #fff; --text: #1e293b; --error: #ef4444; --border: #e2e8f0; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); padding: 2rem; margin: 0; }
    .container { max-width: 900px; margin: 0 auto; }
    .card { background: var(--surface); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--border); }
    .badge { background: var(--error); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }
    .issue { padding: 1rem 0; border-bottom: 1px solid var(--border); }
    .issue:last-child { border-bottom: none; }
    h1 { margin-bottom: 2rem; }
    .meta { color: #64748b; font-size: 0.9rem; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <div class="container" id="app">
    </div>

  <script>
    // 1. RECEIVE DATA (Injected by Node.js)
    window.REPORT_DATA = {{DATA_PLACEHOLDER}};

    // 2. RENDER LOGIC (Client-Side)
    const app = document.getElementById('app');
    const totalFiles = window.REPORT_DATA.length;
    const totalIssues = window.REPORT_DATA.reduce((acc, f) => acc + f.messages.length, 0);
    
    // Render Header
    let html = \`
      <header>
        <h1>🛡️ Accessibility Audit</h1>
        <div class="card">
          <div style="font-size: 1.5rem; font-weight: bold;">
            \${totalIssues === 0 ? '✅ Passed' : '❌ Failed'}
          </div>
          <div>Found \${totalIssues} violations across \${totalFiles} files.</div>
        </div>
      </header>
    \`;

    // Render Files
    if (totalFiles === 0 && totalIssues === 0) {
      html += '<div class="card" style="text-align:center; color:green"><h3>No issues found! Great job.</h3></div>';
    } else {
      window.REPORT_DATA.forEach(file => {
        html += \`
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:2px solid var(--border)">
              <strong>\${file.filePath}</strong>
              <span class="badge">\${file.messages.length}</span>
            </div>
            \${file.messages.map(msg => \`
              <div class="issue">
                <div class="meta">\${msg.wcagClause} • Line \${msg.line}</div>
                <div>\${msg.message}</div>
              </div>
            \`).join('')}
          </div>
        \`;
      });
    }

    app.innerHTML = html;
  </script>
</body>
</html>
`;

// Inject JSON into the placeholder
const finalHtml = htmlTemplate.replace('{{DATA_PLACEHOLDER}}', JSON.stringify(reportData));

fs.writeFileSync(OUTPUT_FILE, finalHtml);
console.log(`✅ Generated portable report: ${OUTPUT_FILE}`);
