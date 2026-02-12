const fs = require('fs');
const path = require('path'); // Add this line

// 1. CAPTURE METADATA FROM ENVIRONMENT
const metadata = {
  repositoryUrl: process.env.TARGET_REPO_URL || 'Unknown Repository',
  branch: process.env.TARGET_BRANCH || 'Default',
  scanDate: new Date().toLocaleString(),
  commitHash: process.env.GITHUB_SHA || 'N/A'
};
metadata.reportGeneratedAt = new Date().toISOString();

// 2. STRICT RULE ALLOWLIST
const ruleMap = {
  // ===========================================================================
  // 📱 REACT NATIVE (Mobile A11y)
  // ===========================================================================
  'react-native-a11y/has-accessibility-hint': 'WCAG 3.3.2 (Labels or Instructions)',
  'react-native-a11y/has-valid-accessibility-descriptors': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-actions': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-component-type': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-live-region': 'WCAG 4.1.3 (Status Messages)',
  'react-native-a11y/has-valid-accessibility-role': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a111y/has-valid-accessibility-state': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-value': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/no-nested-touchables': 'WCAG 2.5.2 (Pointer Cancellation)',
  'react-native-a11y/has-valid-important-for-accessibility': 'WCAG 4.1.2 (Name, Role, Value) [Android]',
  'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'WCAG 1.4.1 (Use of Color) [iOS]',

  // ===========================================================================
  // 🅰️ ANGULAR (Templates)
  // ===========================================================================
  '@angular-eslint/template/alt-text': 'WCAG 1.1.1 (Non-text Content)',
  '@angular-eslint/template/click-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  '@angular-eslint/template/elements-content': 'WCAG 4.1.2 (Name, Role, Value)',
  '@angular-eslint/template/interactive-supports-focus': 'WCAG 2.1.1 (Keyboard)',
  '@angular-eslint/template/label-has-associated-control': 'WCAG 1.3.1 (Info and Relationships)',
  '@angular-eslint/template/mouse-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  '@angular-eslint/template/no-autofocus': 'WCAG 2.4.3 (Focus Order)',
  '@angular-eslint/template/no-distracting-elements': 'WCAG 2.2.2 (Pause, Stop, Hide)',
  '@angular-eslint/template/no-positive-tabindex': 'WCAG 2.4.3 (Focus Order)',
  '@angular-eslint/template/role-has-required-aria': 'WCAG 4.1.2 (Name, Role, Value)',
  '@angular-eslint/template/table-scope': 'WCAG 1.3.1 (Info and Relationships)',
  '@angular-eslint/template/valid-aria': 'WCAG 4.1.2 (Name, Role, Value)',
  '@angular-eslint/template/button-has-type': 'WCAG 3.2.2 (On Input)', 

  // ===========================================================================
  // ⚛️ REACT (Web JSX)
  // ===========================================================================
  'jsx-a11y/alt-text': 'WCAG 1.1.1 (Non-text Content)',
  'jsx-a11y/anchor-ambiguous-text': 'WCAG 2.4.4 (Link Purpose)',
  'jsx-a11y/anchor-has-content': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/anchor-is-valid': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/aria-activedescendant-has-tabindex': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/aria-props': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/aria-proptypes': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/aria-role': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/aria-unsupported-elements': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/autocomplete-valid': 'WCAG 1.3.5 (Identify Input Purpose)',
  'jsx-a11y/click-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/control-has-associated-label': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/heading-has-content': 'WCAG 1.3.1 (Info and Relationships)',
  'jsx-a11y/html-has-lang': 'WCAG 3.1.1 (Language of Page)',
  'jsx-a11y/iframe-has-title': 'WCAG 2.4.1 (Bypass Blocks)',
  'jsx-a11y/img-redundant-alt': 'WCAG 1.1.1 (Non-text Content)',
  'jsx-a11y/interactive-supports-focus': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/label-has-associated-control': 'WCAG 1.3.1 (Info and Relationships)',
  'jsx-a11y/lang': 'WCAG 3.1.2 (Language of Parts)',
  'jsx-a11y/media-has-caption': 'WCAG 1.2.2 (Captions)',
  'jsx-a11y/mouse-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/no-access-key': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/no-aria-hidden-on-focusable': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/no-autofocus': 'WCAG 2.4.3 (Focus Order)',
  'jsx-a11y/no-distracting-elements': 'WCAG 2.2.2 (Pause, Stop, Hide)',
  'jsx-a11y/no-interactive-element-to-noninteractive-role': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/no-noninteractive-element-interactions': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/no-noninteractive-element-to-interactive-role': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/no-noninteractive-tabindex': 'WCAG 2.4.3 (Focus Order)',
  'jsx-a11y/no-redundant-roles': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/no-static-element-interactions': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/prefer-tag-over-role': 'WCAG 1.3.1 (Info and Relationships)',
  'jsx-a11y/role-has-required-aria-props': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/role-supports-aria-props': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/scope': 'WCAG 1.3.1 (Info and Relationships)',
  'jsx-a11y/tabindex-no-positive': 'WCAG 2.4.3 (Focus Order)',

  // ===========================================================================
  // ✌️ VUE.JS
  // ===========================================================================
  'vuejs-accessibility/alt-text': 'WCAG 1.1.1 (Non-text Content)',
  'vuejs-accessibility/anchor-has-content': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/aria-props': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/aria-role': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/aria-unsupported-elements': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/click-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  'vuejs-accessibility/form-control-has-label': 'WCAG 1.3.1 (Info and Relationships)',
  'vuejs-accessibility/heading-has-content': 'WCAG 1.3.1 (Info and Relationships)',
  'vuejs-accessibility/iframe-has-title': 'WCAG 2.4.1 (Bypass Blocks)',
  'vuejs-accessibility/interactive-supports-focus': 'WCAG 2.1.1 (Keyboard)',
  'vuejs-accessibility/label-has-for': 'WCAG 1.3.1 (Info and Relationships)',
  'vuejs-accessibility/media-has-caption': 'WCAG 1.2.2 (Captions)',
  'vuejs-accessibility/mouse-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  'vuejs-accessibility/no-access-key': 'WCAG 2.1.1 (Keyboard)',
  'vuejs-accessibility/no-autofocus': 'WCAG 2.4.3 (Focus Order)',
  'vuejs-accessibility/no-distracting-elements': 'WCAG 2.2.2 (Pause, Stop, Hide)',
  'vuejs-accessibility/no-onchange': 'WCAG 3.2.2 (On Input)',
  'vuejs-accessibility/no-redundant-roles': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/no-static-element-interactions': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/role-has-required-aria-props': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/tabindex-no-positive': 'WCAG 2.4.3 (Focus Order)',
  'vuejs-accessibility/no-aria-hidden-on-focusable': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/no-role-presentation-on-focusable': 'WCAG 1.3.1 (Info and Relationships)',

  // ===========================================================================
  // 🎨 CSS / SCSS (Stylelint A11y) - REQUIRED: stylelint-a11y
  // ===========================================================================
  'a11y/no-outline-none': 'WCAG 2.4.7 (Focus Visible)',
  'a11y/media-prefers-reduced-motion': 'WCAG 2.3.3 (Animation from Interactions)',
  'a11y/content-property-no-static-value': 'WCAG 1.3.1 (Info and Relationships)',
  'a11y/font-size-is-readable': 'WCAG 1.4.4 (Resize Text)',
  'a11y/selector-pseudo-class-focus': 'WCAG 2.4.7 (Focus Visible)',
  'a11y/no-obsolete-attribute': 'WCAG 4.1.1 (Parsing)',
  'a11y/no-text-align-justify': 'WCAG 1.4.8 (Visual Presentation)',
  'a11y/no-display-none': 'WCAG 4.1.2 (Name, Role, Value) [Warning only]',
  
  // Keep these legacy ones if you want, but they are less specific?
  'declaration-property-value-disallowed-list': 'WCAG 2.4.7 (Focus Visible)',
  'declaration-property-unit-disallowed-list': 'WCAG 1.4.4 (Resize Text)',
  'font-family-no-missing-generic-family-keyword': 'Best Practice (Fallback Fonts)'
};

// HELPER: Detect Framework based on Rule ID
const getFramework = (ruleId) => {
  if (ruleId.startsWith('react-native-a11y')) return 'React Native';
  if (ruleId.startsWith('jsx-a11y')) return 'React (Web)';
  if (ruleId.startsWith('@angular')) return 'Angular';
  if (ruleId.startsWith('vue')) return 'Vue.js';
  // [NEW] Better detection for stylelint-a11y
  if (ruleId.startsWith('a11y/') || ruleId.startsWith('declaration-property') || ruleId.startsWith('font-')) return 'CSS/Styles';
  if (ruleId.startsWith('oobee-')) return 'Oobee (HTML)';
  return 'General';
};

const loadJSON = (path) => {
   if (!fs.existsSync(path)) { return []; }
   try { return JSON.parse(fs.readFileSync(path, 'utf8')); } 
   catch (e) { return []; }
};

const eslintRaw = loadJSON('eslint-raw.json');
const stylelintRaw = loadJSON('stylelint-raw.json');
const findOobeeRaw = (baseDir) => {
  if (!fs.existsSync(baseDir)) return null;
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = `${dir}/${e.name}`;
      if (e.isDirectory()) {
        const found = walk(full);
        if (found) return found;
      } else if (e.isFile() && e.name === 'oobee-raw.json') {
        return full;
      }
    }
    return null;
  };
  return walk(baseDir);
};

const OOBEE_RAW = 'oobee-raw.json';
let oobeeRaw = loadJSON(OOBEE_RAW);

if (!fs.existsSync(OOBEE_RAW)) {
  const found = findOobeeRaw('results');
  console.log('[map-wcag] oobee-raw.json not found in cwd.', found ? `Found at ${found}` : '');
  if (found) {
    oobeeRaw = JSON.parse(fs.readFileSync(found, 'utf8'));
    console.log('[map-wcag] loaded oobee-raw.json from results');
  }
} else {
  console.log('[map-wcag] oobee-raw.json entries:', Array.isArray(oobeeRaw) ? oobeeRaw.length : 0);
}

const normalizedStylelint = stylelintRaw.map(file => ({
  filePath: file.source.split('/target-code/')[1] || file.source,
  messages: file.warnings.map(w => ({
    ruleId: w.rule,
    message: w.text,
    line: w.line,
    column: w.column,
    severity: 2
  }))
}));

const normalizeFilePath = (p) => {
	if (!p || typeof p !== 'string') return 'Unknown Source';
	const cleaned = p.split('?')[0].split('#')[0];
	if (cleaned.endsWith('.oobee-sitemap.xml') || cleaned.endsWith('oobee-sitemap.xml')) return 'Local Sitemap';
	if (cleaned.startsWith('file://')) return fileURLToPath(cleaned);
	return cleaned;
};

const normalizeOobee = (raw) => {
  if (!raw) return [];

  // 1. Detect and Handle Summary Format (Bucketed by mustFix/etc)
  // This happens if oobee-raw.json is already aggregated by the scanner
  const inputs = Array.isArray(raw) ? raw : [raw];
  const isSummaryFormat = inputs.some(i => i && (i.mustFix || i.goodToFix || i.needsReview));

  if (isSummaryFormat) {
    const fileMap = new Map(); // url -> messages[]

    inputs.forEach(summary => {
      ['mustFix', 'goodToFix', 'needsReview'].forEach(bucket => {
        const section = summary[bucket];
        if (!section || !section.rules) return;

        Object.entries(section.rules).forEach(([ruleId, ruleData]) => {
            const prefixedRuleId = ruleId.startsWith('oobee-') ? ruleId : `oobee-${ruleId}`;
            const items = Array.isArray(ruleData.items) ? ruleData.items : [];
            const description = ruleData.description || 'Oobee violation';
            
            items.forEach(item => {
                const url = item.url || 'unknown-oobee-source';
                if (!fileMap.has(url)) {
                    fileMap.set(url, []);
                }
                
                fileMap.get(url).push({
                    ruleId: prefixedRuleId,
                    message: item.message || description,
                    line: null, 
                    column: null,
                    html: item.html,
                    xpath: item.xpath,
                    severity: bucket === 'mustFix' ? 2 : 1 // ESLint style Critical error for mustFix, else non-critical
                });
            });
        });
      });
    });

    return Array.from(fileMap.entries()).map(([filePath, messages]) => ({
        filePath,
        messages
    }));
  }

  // 2. Handle Standard Page-Based Format
  const pages = Array.isArray(raw) ? raw : (raw.pages || raw.results || raw.data || []);
  if (!Array.isArray(pages)) return [];
  return pages.map(page => {
    const axe = page.axeScanResults || page.axe || page;
    const violations = Array.isArray(axe?.violations) ? axe.violations : [];

    // Extract filePath from page object so it's defined for the return statement
    const filePath = page.pageUrl || page.url || page.location || 'raw-html';

    const messages = violations.flatMap(v => {
      const baseMessage = v.description || v.help || v.id || 'Oobee violation';
      const nodes = Array.isArray(v.nodes) ? v.nodes : [];
      // Prefix standard rules with 'oobee-' so they pass the filter check
      const ruleId = `oobee-${v.id || 'unknown'}`;
      
      if (nodes.length === 0) {
        return [{
          ruleId: ruleId,
          message: baseMessage,
          line: null,
          column: null,
          severity: 2
        }];
      }
      return nodes.map(n => ({
        ruleId: ruleId,
        message: n.failureSummary ? `${baseMessage} — ${n.failureSummary}` : baseMessage,
        line: null,
        column: null,
        severity: 2
      }));
    });
    return { filePath, messages };
  }).filter(Boolean);
};

const normalizedOobee = normalizeOobee(oobeeRaw);

const buildOobeeSummary = (raw) => {
  const pages = Array.isArray(raw) ? raw : (raw?.pages || raw?.results || raw?.data || []);
  if (!Array.isArray(pages) || pages.length === 0) return null;

  const initBucket = () => ({ totalItems: 0, rules: {} });
  const summary = { mustFix: initBucket(), goodToFix: initBucket(), needsReview: initBucket() };

  const bucketForImpact = (impact) => {
    if (impact === 'critical') return 'mustFix';
    if (impact === 'serious') return 'needsReview';
    if (impact === 'moderate' || impact === 'minor') return 'goodToFix';
    return 'needsReview';
  };

  const parseWcagTag = (tag) => {
    if (!tag || typeof tag !== 'string') return null;
    if (tag === 'wcag2a') return { tag, level: 'A', clause: null };
    if (tag === 'wcag2aa') return { tag, level: 'AA', clause: null };
    if (tag === 'wcag2aaa') return { tag, level: 'AAA', clause: null };
    if (tag === 'wcag21a') return { tag, level: 'A', clause: null };
    if (tag === 'wcag21aa') return { tag, level: 'AA', clause: null };
    if (tag === 'wcag21aaa') return { tag, level: 'AAA', clause: null };
    if (tag === 'wcag22a') return { tag, level: 'A', clause: null };
    if (tag === 'wcag22aa') return { tag, level: 'AA', clause: null };
    if (tag === 'wcag22aaa') return { tag, level: 'AAA', clause: null };
    const m = tag.match(/^wcag(\d{3,4})$/);
    if (!m) return null;
    const digits = m[1];
    const clause = digits.length === 3
      ? `${digits[0]}.${digits[1]}.${digits[2]}`
      : `${digits[0]}.${digits[1]}.${digits[2]}${digits[3]}`;
    return { tag, level: null, clause };
  };

  for (const page of pages) {
    const axe = page.axeScanResults || page.axe || page;
    const violations = Array.isArray(axe?.violations) ? axe.violations : [];
    const pageUrl = page.pageUrl || page.url || page.location || 'raw-html';
    for (const v of violations) {
      const bucket = bucketForImpact(v.impact);
      const ruleId = v.id || 'oobee-unknown';
      const rule = summary[bucket].rules[ruleId] || {
        description: v.description || v.help || ruleId,
        axeImpact: v.impact || 'unknown',
        helpUrl: v.helpUrl || '',
        conformance: Array.isArray(v.tags) ? v.tags.filter(t => String(t).startsWith('wcag')) : [],
        conformanceBreakdown: [],
        totalItems: 0,
        items: []
      };
      rule.conformanceBreakdown = (rule.conformance || [])
        .map(parseWcagTag)
        .filter(Boolean);
      const nodes = Array.isArray(v.nodes) ? v.nodes : [];
      for (const n of nodes) {
        rule.items.push({
          html: n.html || '',
          message: n.failureSummary || v.description || v.help || 'Oobee violation',
          xpath: Array.isArray(n.target) ? n.target.join(' ') : (n.xpath || n.target || ''),
          url: pageUrl
        });
      }
      rule.totalItems = rule.items.length;
      summary[bucket].rules[ruleId] = rule;
    }
  }

  for (const key of Object.keys(summary)) {
    summary[key].totalItems = Object.values(summary[key].rules)
      .reduce((acc, r) => acc + (r.totalItems || 0), 0);
  }

  return summary;
};

const isOobeeSummary = (raw) => !!raw && typeof raw === 'object' && ('mustFix' in raw || 'goodToFix' in raw || 'needsReview' in raw);

const normalizeOobeeSummary = (raw) => ({
  mustFix: { totalItems: raw?.mustFix?.totalItems || 0, rules: raw?.mustFix?.rules || {} },
  goodToFix: { totalItems: raw?.goodToFix?.totalItems || 0, rules: raw?.goodToFix?.rules || {} },
  needsReview: { totalItems: raw?.needsReview?.totalItems || 0, rules: raw?.needsReview?.rules || {} }
});

const mergeOobeeSummaries = (list) => {
  const merged = normalizeOobeeSummary({});
  const mergeBucket = (target, source) => {
    for (const [ruleId, r] of Object.entries(source.rules || {})) {
      const existing = target.rules[ruleId] || {
        description: r.description || '',
        axeImpact: r.axeImpact || 'unknown',
        helpUrl: r.helpUrl || '',
        conformance: r.conformance || [],
        conformanceBreakdown: r.conformanceBreakdown || [],
        totalItems: 0,
        items: []
      };
      existing.items = existing.items.concat(r.items || []);
      existing.totalItems = existing.items.length;
      target.rules[ruleId] = existing;
    }
    target.totalItems = Object.values(target.rules).reduce((acc, rr) => acc + (rr.totalItems || 0), 0);
  };
  for (const raw of list) {
    const s = normalizeOobeeSummary(raw);
    mergeBucket(merged.mustFix, s.mustFix);
    mergeBucket(merged.goodToFix, s.goodToFix);
    mergeBucket(merged.needsReview, s.needsReview);
  }
  return merged;
};

const oobeeSummary = Array.isArray(oobeeRaw) && oobeeRaw.every(isOobeeSummary)
  ? mergeOobeeSummaries(oobeeRaw)
  : (isOobeeSummary(oobeeRaw) ? normalizeOobeeSummary(oobeeRaw) : buildOobeeSummary(oobeeRaw));

if (oobeeSummary) {
  console.log('[map-wcag] oobee summary totals:', {
    mustFix: oobeeSummary.mustFix?.totalItems || 0,
    goodToFix: oobeeSummary.goodToFix?.totalItems || 0,
    needsReview: oobeeSummary.needsReview?.totalItems || 0
  });
}

const allFiles = [...eslintRaw, ...normalizedStylelint, ...normalizedOobee];
const unmappedRules = new Set();

const getWcagClause = (ruleId) => {
  if (ruleMap[ruleId]) return ruleMap[ruleId];
  if (ruleId.startsWith('oobee-')) return 'Oobee (Unmapped Rule)';
  return null;
};

const violations = allFiles.map(f => {
  const messages = Array.isArray(f.messages) ? f.messages : [];
  const validMsgs = messages
    .map(m => ({ ...m, wcagClause: getWcagClause(m.ruleId || '') }))
    .filter(m => {
      if (m.wcagClause) return true;
      if (m.ruleId) unmappedRules.add(m.ruleId);
      return false;
    });

  if (validMsgs.length === 0) return null;

  const normalizedPath = normalizeFilePath(f.filePath);
  f.filePath = (normalizedPath || '').split('/target-code/')[1] || normalizedPath || 'Unknown Source';
  f.messages = validMsgs.map(m => ({
    ...m,
    framework: getFramework(m.ruleId || '')
  }));
  return f;
}).filter(Boolean);

if (unmappedRules.size > 0) {
  console.log("\n⚠️  FILTERED OUT (Non-mapped rules):");
  unmappedRules.forEach(r => console.log(`   - ${r}`));
  console.log("\n");
}

const finalReport = {
  metadata: metadata,
  violations: violations,
  oobeeSummary: oobeeSummary
};

fs.writeFileSync('accessibility-report.json', JSON.stringify(finalReport, null, 2));
console.log(`✅ Scan Complete: ${violations.length} files found with issues.`);

// Read and log ESLint stats
const eslintPath = path.join(process.cwd(), 'eslint-raw.json');
if (fs.existsSync(eslintPath)) {
    try {
        const eslintRaw = JSON.parse(fs.readFileSync(eslintPath, 'utf8'));
        const eslintCount = eslintRaw.reduce((sum, file) => sum + (file.messages || []).length, 0);
        console.log(`ESLint Violations: ${eslintCount}`);
    } catch (e) {
        console.error('Could not read eslint stats:', e.message);
    }
}

// Read and log Stylelint stats
const stylelintPath = path.join(process.cwd(), 'stylelint-raw.json');
if (fs.existsSync(stylelintPath)) {
    try {
        const stylelintRaw = JSON.parse(fs.readFileSync(stylelintPath, 'utf8'));
        const stylelintCount = stylelintRaw.reduce((sum, file) => sum + (file.warnings || []).length, 0);
        console.log(`Stylelint Violations: ${stylelintCount}`);
    } catch (e) {
        console.error('Could not read stylelint stats:', e.message);
    }
}