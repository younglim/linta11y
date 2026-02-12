const fs = require('fs');
const path = require('path');

const jsonPath = 'accessibility-report.json';
const outPath = 'accessibility-report.html';

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Error: ${jsonPath} not found.`);
  process.exit(1);
}

// Read JSON and escape HTML tag characters to prevent script injection issues (e.g. </script> inside JSON)
const reportData = fs.readFileSync(jsonPath, 'utf-8')
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e');

// In future, let's use EJS or something for templating if this grows more complex
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>linta11y Static Code Accessibility Audit Report</title>
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
    
    /* Link Styling */
    .meta-value a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    .meta-value a:hover {
      text-decoration: underline;
    }

    /* VSCode Link Styling */
    .filename a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    .filename a:hover {
      text-decoration: underline;
    }
    .line-box a {
      color: inherit;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
    .line-box:hover {
      background: #dbeafe;
      cursor: pointer;
    }

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
    
    .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
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

    /* CATEGORY TAGS */
    .tag-must-fix { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
    .tag-good-to-fix { background: #fffbeb; color: #92400e; border-color: #fde68a; }
    .tag-needs-review { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }

    /* CODE BLOCKS */
    .code-block {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.75rem;
      margin-top: 0.75rem;
      font-family: monospace;
      font-size: 0.85rem;
      overflow-x: auto;
    }
    .code-row {
      margin-bottom: 0.5rem;
    }
    .code-row:last-child { margin-bottom: 0; }
    .code-label {
      font-weight: 700;
      color: #64748b;
      font-size: 0.7rem;
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.2rem;
    }
    .code-val {
      color: #334155;
      white-space: pre-wrap;
      word-break: break-all;
    }

    /* FILTERS */
    .filter-row { margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1rem; }
    
    details.filter-dropdown { position: relative; display: inline-block; }
    details.filter-dropdown summary { 
        cursor: pointer; 
        padding: 0.5rem 1rem; 
        background: white; 
        border: 1px solid var(--border); 
        border-radius: 6px; 
        font-weight: 500;
        list-style: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text);
    }
    details.filter-dropdown summary::-webkit-details-marker { display: none; }
    details.filter-dropdown summary::after { content: "▼"; font-size: 0.7em; margin-left: auto; }
    details.filter-dropdown[open] summary::after { content: "▲"; }
    
    .filter-content {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 0.5rem;
        background: white;
        border: 1px solid var(--border);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 0.75rem;
        width: 200px;
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .filter-content label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.25rem; user-select: none; }
    .filter-content label:hover { color: var(--primary); }
    .filter-content input[type="checkbox"] { transform: scale(1.2); cursor: pointer; }
  </style>
</head>
<body>
  <div class="container" id="app"></div>

  <script>
    // INJECTED DATA (Escaped)
    const DATA = ${reportData};
    const app = document.getElementById('app');

    // Helper to create VSCode URL
    const createVSCodeUrl = (filePath, line) => {
      // Remove file:// prefix if present and normalize path
      const normalizedPath = filePath
        .replace(/^file:\\/\\//, '')
        .replace(/\\\\/g, '/');
      
      if (line && line !== '—') {
        return \`vscode://file\${normalizedPath}:\${line}\`;
      }
      return \`vscode://file\${normalizedPath}\`;
    };

    // Helper to map rules to categories
    const buildRuleMap = (summary) => {
        const map = {};
        if (!summary) return map;
        ['mustFix', 'goodToFix', 'needsReview'].forEach(type => {
            const group = summary[type];
            if (group && group.rules) {
                Object.keys(group.rules).forEach(ruleShortName => {
                    // Normalize both simple IDs and namespaced IDs to categories
                    map[ruleShortName] = type;
                    map['oobee-' + ruleShortName] = type;
                });
            }
        });
        return map;
    };

    const getCatLabel = (type) => {
        if (type === 'mustFix') return 'Must Fix';
        if (type === 'goodToFix') return 'Good to Fix';
        if (type === 'needsReview') return 'Needs Review';
        return 'Issue';
    };
    
    const getCatClass = (type) => {
        if (type === 'mustFix') return 'tag-must-fix';
        if (type === 'goodToFix') return 'tag-good-to-fix';
        if (type === 'needsReview') return 'tag-needs-review';
        return 'tag-wcag';
    };

    // FILTER LOGIC
    const applyFilters = () => {
        const checked = Array.from(document.querySelectorAll('.cat-filter:checked')).map(cb => cb.value);
        const issues = document.querySelectorAll('.issue');
        
        issues.forEach(issue => {
            const cat = issue.getAttribute('data-category');
            // If the issue category is in the checked list, show it
            if (checked.includes(cat)) {
                issue.style.display = '';
            } else {
                issue.style.display = 'none';
            }
        });

        // Hide empty file cards
        const cards = document.querySelectorAll('.file-card');
        
        cards.forEach(card => {
            const visibleIssues = Array.from(card.querySelectorAll('.issue')).filter(i => i.style.display !== 'none');
            if (visibleIssues.length > 0) {
                card.style.display = '';
                // Update badge count?
                const badge = card.querySelector('.count-badge');
                if (badge) badge.innerText = visibleIssues.length;
            } else {
                card.style.display = 'none';
            }
        });
    };

    // Helper to escape HTML for display
    const escapeHtml = (unsafe) => {
        if (!unsafe) return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };

    // Helper to format messages with bullet points for lists
    const formatMessage = (msg) => {
        const safe = escapeHtml(msg);
        return safe.replace(/(Fix\\s+(?:one|any|all)\\s+of\\s+the\\s+following:)([\\s\\S]*)/, (match, prefix, rest) => {
            return prefix + rest.replace(/\\n\\s*/g, '<br> &bull; ');
        }).replace(/\\n/g, '<br>');
    };

    try {
      const meta = DATA.metadata || {};
      const violations = DATA.violations || [];
      const oobeeSummary = DATA.oobeeSummary || null;
      const ruleMap = buildRuleMap(oobeeSummary);

      const totalFiles = violations.length;
      const totalIssues = violations.reduce((acc, f) => acc + f.messages.length, 0);
      const isSuccess = totalIssues === 0;

      // Helper to make URL clickable
      const repoUrl = meta.repositoryUrl || 'Local Scan';
      const repoDisplay = repoUrl.startsWith('http') 
        ? \`<a href="\${repoUrl}" target="_blank" rel="noopener noreferrer">\${repoUrl}</a>\` 
        : repoUrl;

      // RENDER HEADER
      let html = \`
        <header>
          <h1>linta11y Static Code Accessibility Audit Report</h1>
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Repository</span>
              <span class="meta-value">\${repoDisplay}</span>
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

          <div class="filter-row">
            <details class="filter-dropdown">
                <summary>Filter Categories</summary>
                <div class="filter-content">
                    <label><input type="checkbox" class="cat-filter" value="mustFix" checked> Must Fix</label>
                    <label><input type="checkbox" class="cat-filter" value="goodToFix" checked> Good To Fix</label>
                    <label><input type="checkbox" class="cat-filter" value="needsReview"> Needs Review</label>
                </div>
            </details>
          </div>
        </header>
      \`;

      // RENDER VIOLATIONS LINEARLY (Grouped by file, but showing category chip per item)
      if (totalFiles === 0 && !isSuccess) {
        html += '<div style="text-align:center; padding:3rem; color:#64748b">No scannable files found or scanner failed to run.</div>';
      } else {
        violations.forEach(file => {
          const rawPath = file.filePath || 'Unknown Source';
          const safePath = rawPath
            .replace(/^file:\\/\\//, '')
            .replace(/\\\\/g, '/')
            .replace(/\\.oobee-sitemap\\.xml$/i, 'Local Sitemap');

          const vscodeUrl = createVSCodeUrl(rawPath);
          const fileNameDisplay = safePath.includes('Unknown') || safePath.includes('Local Sitemap')
            ? safePath
            : \`<a href="\${vscodeUrl}" title="Open in VSCode">\${safePath}</a>\`;

          html += \`
            <div class="file-card">
              <div class="file-header">
                <span class="filename">\${fileNameDisplay}</span>
                <span class="count-badge">\${file.messages.length}</span>
              </div>
              \`;
              
          file.messages.forEach(msg => {
            const lineVal = msg.line ?? '—';
            const ruleId = msg.ruleId || 'unknown-rule';
            
            // Determine category
            const catType = ruleMap[msg.ruleId] || 'needsReview'; // Default to Needs Review if not found
            const catLabel = getCatLabel(catType);
            const catClass = getCatClass(catType);

            // Create VSCode link for line number
            const vscodeLineUrl = createVSCodeUrl(rawPath, msg.line);
            const lineBoxContent = lineVal !== '—' && !safePath.includes('Unknown') && !safePath.includes('Local Sitemap')
              ? \`<a href="\${vscodeLineUrl}" title="Open in VSCode at line \${lineVal}">
                  <span class="line-label">Line</span>
                  <span class="line-val">\${lineVal}</span>
                </a>\`
              : \`<span class="line-label">Line</span>
                <span class="line-val">\${lineVal}</span>\`;

            html += \`
              <div class="issue" data-category="\${catType}">
                <div class="line-box">
                  \${lineBoxContent}
                </div>
                <div class="content">
                    <div class="tags">
                        <span class="tag \${catClass}">\${catLabel}</span>
                        <span class="tag tag-framework">\${msg.framework || 'General'}</span>
                        <span class="tag tag-wcag">\${msg.wcagClause || 'Best Practice'}</span>
                        <span class="tag tag-rule">\${ruleId}</span>
                    </div>
                  <div class="message">\${formatMessage(msg.message)}</div>
                  
                  <div class="code-block">
                    \${msg.html ? \`
                    <div class="code-row">
                        <span class="code-label">Affected HTML</span>
                        <div class="code-val">\${escapeHtml(msg.html)}</div>
                    </div>\` : ''}
                    \${msg.xpath ? \`
                    <div class="code-row">
                        <span class="code-label">XPath</span>
                        <div class="code-val">\${msg.xpath}</div>
                    </div>\` : ''}
                  </div>
                </div>
              </div>
            \`;
          });
          
          html += \`</div>\`;
        });
      }

      app.innerHTML = html;

      // Attach Event Listeners
      document.querySelectorAll('.cat-filter').forEach(cb => {
        cb.addEventListener('change', applyFilters);
      });
      // Run once on load to respect default checked state (hiding needsReview)
      applyFilters();

    } catch (err) {
      console.error(err);
      app.innerHTML = \`<pre style="white-space:pre-wrap; background:#fff3f3; border:1px solid #fecaca; padding:1rem; border-radius:8px; color:#991b1b;">Report render error: \${String(err)}</pre>\`;
    }
  </script>
</body>
</html>`;

fs.writeFileSync(outPath, htmlTemplate);
console.log(`✅ Generated ${outPath} from ${jsonPath}`);
