const fs = require('fs');

const ruleMap = {
  // ===========================================================================
  // 📱 REACT NATIVE (Mobile Accessibility)
  // Source: eslint-plugin-react-native-a11y documentation
  // ===========================================================================
  'react-native-a11y/accessibility-label': 'WCAG 1.1.1 (Non-text Content)',
  'react-native-a11y/accessible-image-has-label': 'WCAG 1.1.1 (Non-text Content)',
  'react-native-a11y/has-accessibility-hint': 'WCAG 3.3.2 (Labels or Instructions)',
  'react-native-a11y/has-accessibility-props': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-actions': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-component-type': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-descriptors': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'WCAG 1.4.1 (Use of Color)',
  'react-native-a11y/has-valid-accessibility-live-region': 'WCAG 4.1.3 (Status Messages)',
  'react-native-a11y/has-valid-accessibility-role': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-state': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-states': 'WCAG 4.1.2 (Name, Role, Value)', // Deprecated but still used
  'react-native-a11y/has-valid-accessibility-traits': 'WCAG 4.1.2 (Name, Role, Value)', // Deprecated but still used
  'react-native-a11y/has-valid-accessibility-value': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-important-for-accessibility': 'WCAG 4.1.2 (Name, Role, Value)', // Android specific
  'react-native-a11y/no-nested-touchables': 'WCAG 2.5.2 (Pointer Cancellation)',

  // ===========================================================================
  // 🅰️ ANGULAR (Templates)
  // Source: @angular-eslint/eslint-plugin-template documentation
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

  // ===========================================================================
  // ⚛️ REACT (JSX A11y)
  // Source: eslint-plugin-jsx-a11y documentation
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
  // ✌️ VUE.JS (Template A11y)
  // Source: eslint-plugin-vuejs-accessibility documentation
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

  // ===========================================================================
  // 🌐 HTML (Raw HTML)
  // Source: @html-eslint/eslint-plugin documentation
  // ===========================================================================
  '@html-eslint/require-alt': 'WCAG 1.1.1 (Non-text Content)',
  '@html-eslint/require-lang': 'WCAG 3.1.1 (Language of Page)',
  '@html-eslint/require-title': 'WCAG 2.4.2 (Page Titled)',
  '@html-eslint/no-duplicate-id': 'WCAG 4.1.1 (Parsing)',
  '@html-eslint/no-inline-styles': 'Best Practice (Separation of Concerns)',
  '@html-eslint/require-meta-viewport': 'Best Practice (Responsive Design)',
  '@html-eslint/no-abstract-roles': 'WCAG 4.1.2 (Name, Role, Value)',
  '@html-eslint/no-accesskey-attrs': 'WCAG 2.1.1 (Keyboard)',
  '@html-eslint/no-aria-hidden-body': 'WCAG 4.1.2 (Name, Role, Value)',
  '@html-eslint/no-aria-hidden-on-focusable': 'WCAG 4.1.2 (Name, Role, Value)',
  '@html-eslint/no-empty-headings': 'WCAG 1.3.1 (Info and Relationships)',
  '@html-eslint/no-heading-inside-button': 'WCAG 4.1.2 (Name, Role, Value)',
  '@html-eslint/no-invalid-role': 'WCAG 4.1.2 (Name, Role, Value)',
  '@html-eslint/no-non-scalable-viewport': 'WCAG 1.4.4 (Resize text)',
  '@html-eslint/no-positive-tabindex': 'WCAG 2.4.3 (Focus Order)',
  '@html-eslint/no-skip-heading-levels': 'WCAG 1.3.1 (Info and Relationships)',
  '@html-eslint/require-form-method': 'Best Practice (Security/Robustness)',
  '@html-eslint/require-frame-title': 'WCAG 2.4.1 (Bypass Blocks)',
  '@html-eslint/require-input-label': 'WCAG 3.3.2 (Labels or Instructions)',

  // ===========================================================================
  // 🎨 CSS / SCSS (Stylelint)
  // ===========================================================================
  // Strict Accessibility
  'declaration-property-value-disallowed-list': 'WCAG 2.4.7 (Focus Visible)', // catches outline: none
  // Best Practices (Often related to readability or clean code)
  'alpha-value-notation': 'Best Practice (Modern CSS)',
  'color-function-notation': 'Best Practice (Modern CSS)',
  'property-no-vendor-prefix': 'Best Practice (Clean Code)',
  'scss/no-global-function-names': 'Best Practice (Modern SCSS)',
  'declaration-empty-line-before': 'Best Practice (Readability)',
  'font-family-no-missing-generic-family-keyword': 'Best Practice (Fallback Fonts)',
  'unit-no-unknown': 'Best Practice (Valid CSS)',
  'media-feature-name-no-unknown': 'Best Practice (Valid Media Queries)'
};

// --- FILE LOADING & PROCESSING LOGIC ---
const loadJSON = (path) => {
   if (!fs.existsSync(path)) { console.log(`Skipping ${path}: Not found`); return []; }
   try { return JSON.parse(fs.readFileSync(path, 'utf8')); } 
   catch (e) { console.log(`Skipping ${path}: Invalid JSON`); return []; }
};

// Load raw reports
const eslintRaw = loadJSON('eslint-raw.json');
const stylelintRaw = loadJSON('stylelint-raw.json');

// Normalize Stylelint report to match ESLint structure
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

// Combine reports
const allFiles = [...eslintRaw, ...normalizedStylelint];
const unmappedRules = new Set();

// Filter and Enrich
const finalReport = allFiles.map(f => {
   // Filter messages: Keep if in ruleMap, log if not
   const validMsgs = f.messages.filter(m => {
     if (ruleMap[m.ruleId]) return true;
     // Debug: Track what we are missing
     unmappedRules.add(m.ruleId); 
     return false;
   });

   if (validMsgs.length === 0) return null;

   f.filePath = f.filePath.split('/target-code/')[1] || f.filePath;
   f.messages = validMsgs.map(m => ({
     ...m,
     wcagClause: ruleMap[m.ruleId]
   }));
   return f;
}).filter(Boolean);

// --- DEBUG OUTPUT ---
// This prints rules found in the scan but missing from our map
if (unmappedRules.size > 0) {
  console.log("\n⚠️  WARNING: The following rules were detected but filtered out (consider adding them to map-wcag.js):");
  unmappedRules.forEach(r => console.log(`   - ${r}`));
  console.log("\n");
}

// Write Final Report
fs.writeFileSync('accessibility-report.json', JSON.stringify(finalReport, null, 2));
console.log(`✅ Total Code Scan: ${finalReport.length} files with A11y issues.`);
