const fs = require('fs');

const ruleMap = {
  // --- CSS / SCSS (Stylelint) ---
  // Accessibility Critical
  'declaration-property-value-disallowed-list': 'WCAG 2.4.7 (Focus Visible)',
  'font-family-no-missing-generic-family-keyword': 'Best Practice (Fallback Fonts)',
  'unit-no-unknown': 'Best Practice (Valid CSS)',
  'media-feature-name-no-unknown': 'Best Practice (Valid Media Queries)',
  // Best Practices (Keep these for clean code, even if not strict WCAG)
  'alpha-value-notation': 'Best Practice (Modern CSS)',
  'color-function-notation': 'Best Practice (Modern CSS)',
  'property-no-vendor-prefix': 'Best Practice (Clean Code)',
  'scss/no-global-function-names': 'Best Practice (Modern SCSS)',
  'declaration-empty-line-before': 'Best Practice (Readability)',

  // --- REACT NATIVE (Mobile A11y) ---
  'react-native-a11y/accessibility-label': 'WCAG 1.1.1 (Non-text Content)',
  'react-native-a11y/accessible-image-has-label': 'WCAG 1.1.1 (Non-text Content)',
  'react-native-a11y/has-accessibility-hint': 'WCAG 3.3.2 (Labels or Instructions)',
  'react-native-a11y/has-valid-accessibility-role': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-state': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-value': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-actions': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/no-nested-touchables': 'WCAG 2.5.2 (Pointer Cancellation)',
  'react-native-a11y/has-valid-accessibility-component-type': 'WCAG 4.1.2 (Name, Role, Value)',
  'react-native-a11y/has-valid-accessibility-live-region': 'WCAG 4.1.3 (Status Messages)',

  // --- ANGULAR (Templates) ---
  '@angular-eslint/template/alt-text': 'WCAG 1.1.1 (Non-text Content)',
  '@angular-eslint/template/elements-content': 'WCAG 1.3.1 (Info and Relationships)',
  '@angular-eslint/template/valid-aria': 'WCAG 4.1.2 (Name, Role, Value)',
  '@angular-eslint/template/click-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  '@angular-eslint/template/mouse-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  '@angular-eslint/template/label-has-associated-control': 'WCAG 1.3.1 (Info and Relationships)',
  '@angular-eslint/template/role-has-required-aria': 'WCAG 4.1.2 (Name, Role, Value)',
  '@angular-eslint/template/table-scope': 'WCAG 1.3.1 (Info and Relationships)',
  '@angular-eslint/template/no-distracting-elements': 'WCAG 2.2.2 (Pause, Stop, Hide)',
  '@angular-eslint/template/no-positive-tabindex': 'WCAG 2.4.3 (Focus Order)',
  '@angular-eslint/template/no-autofocus': 'WCAG 2.4.3 (Focus Order)',

  // --- REACT (JSX A11y) ---
  'jsx-a11y/alt-text': 'WCAG 1.1.1 (Non-text Content)',
  'jsx-a11y/anchor-has-content': 'WCAG 2.4.4 (Link Purpose)',
  'jsx-a11y/anchor-is-valid': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/aria-activedescendant-has-tabindex': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/aria-props': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/aria-proptypes': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/aria-role': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/aria-unsupported-elements': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/autocomplete-valid': 'WCAG 1.3.5 (Identify Input Purpose)',
  'jsx-a11y/click-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/heading-has-content': 'WCAG 1.3.1 (Info and Relationships)',
  'jsx-a11y/html-has-lang': 'WCAG 3.1.1 (Language of Page)',
  'jsx-a11y/iframe-has-title': 'WCAG 2.4.1 (Bypass Blocks)',
  'jsx-a11y/img-redundant-alt': 'Best Practice (Redundant Alt)',
  'jsx-a11y/interactive-supports-focus': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/label-has-associated-control': 'WCAG 1.3.1 (Info and Relationships)',
  'jsx-a11y/media-has-caption': 'WCAG 1.2.1 (Audio-only and Video-only)',
  'jsx-a11y/mouse-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/no-access-key': 'WCAG 2.1.1 (Keyboard)',
  'jsx-a11y/no-autofocus': 'WCAG 2.4.3 (Focus Order)',
  'jsx-a11y/no-distracting-elements': 'WCAG 2.2.2 (Pause, Stop, Hide)',
  'jsx-a11y/no-interactive-element-to-noninteractive-role': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/no-noninteractive-element-interactions': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/no-noninteractive-tabindex': 'WCAG 2.4.3 (Focus Order)',
  'jsx-a11y/no-redundant-roles': 'Best Practice (Redundant Role)',
  'jsx-a11y/no-static-element-interactions': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/role-has-required-aria-props': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/role-supports-aria-props': 'WCAG 4.1.2 (Name, Role, Value)',
  'jsx-a11y/scope': 'WCAG 1.3.1 (Info and Relationships)',
  'jsx-a11y/tabindex-no-positive': 'WCAG 2.4.3 (Focus Order)',

  // --- VUE.JS ---
  'vuejs-accessibility/alt-text': 'WCAG 1.1.1 (Non-text Content)',
  'vuejs-accessibility/anchor-has-content': 'WCAG 2.4.4 (Link Purpose)',
  'vuejs-accessibility/aria-props': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/aria-role': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/aria-unsupported-elements': 'WCAG 4.1.2 (Name, Role, Value)',
  'vuejs-accessibility/click-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  'vuejs-accessibility/form-control-has-label': 'WCAG 1.3.1 (Info and Relationships)',
  'vuejs-accessibility/heading-has-content': 'WCAG 1.3.1 (Info and Relationships)',
  'vuejs-accessibility/iframe-has-title': 'WCAG 2.4.1 (Bypass Blocks)',
  'vuejs-accessibility/interactive-supports-focus': 'WCAG 2.1.1 (Keyboard)',
  'vuejs-accessibility/label-has-for': 'WCAG 1.3.1 (Info and Relationships)',
  'vuejs-accessibility/media-has-caption': 'WCAG 1.2.1 (Audio-only and Video-only)',
  'vuejs-accessibility/mouse-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  'vuejs-accessibility/no-autofocus': 'WCAG 2.4.3 (Focus Order)',
  'vuejs-accessibility/no-distracting-elements': 'WCAG 2.2.2 (Pause, Stop, Hide)',
  'vuejs-accessibility/no-positive-tabindex': 'WCAG 2.4.3 (Focus Order)',
  'vuejs-accessibility/role-has-required-aria-props': 'WCAG 4.1.2 (Name, Role, Value)',

  // --- HTML (Generic) ---
  '@html-eslint/require-alt': 'WCAG 1.1.1 (Non-text Content)',
  '@html-eslint/require-lang': 'WCAG 3.1.1 (Language of Page)',
  '@html-eslint/require-title': 'WCAG 2.4.2 (Page Titled)',
  '@html-eslint/no-duplicate-id': 'WCAG 4.1.1 (Parsing)',
  '@html-eslint/no-inline-styles': 'Best Practice (Separation of Concerns)',
  '@html-eslint/require-meta-viewport': 'Best Practice (Responsive Design)'
};

const loadJSON = (path) => {
   if (!fs.existsSync(path)) { console.log(`Skipping ${path}: Not found`); return []; }
   try { return JSON.parse(fs.readFileSync(path, 'utf8')); } 
   catch (e) { console.log(`Skipping ${path}: Invalid JSON`); return []; }
};

const eslintRaw = loadJSON('eslint-raw.json');
const stylelintRaw = loadJSON('stylelint-raw.json');

// Normalize Stylelint
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

const allFiles = [...eslintRaw, ...normalizedStylelint];
const unmappedRules = new Set();

const finalReport = allFiles.map(f => {
   // Filter messages: Keep if in ruleMap, log if not
   const validMsgs = f.messages.filter(m => {
     if (ruleMap[m.ruleId]) return true;
     // Track missing rules for debugging
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
// This will print any rules the scanner detected that you haven't mapped yet.
if (unmappedRules.size > 0) {
  console.log("\n⚠️  WARNING: The following rules were detected but filtered out (consider adding them to map-wcag.js):");
  unmappedRules.forEach(r => console.log(`   - ${r}`));
  console.log("\n");
}

fs.writeFileSync('accessibility-report.json', JSON.stringify(finalReport, null, 2));
console.log(`✅ Total Code Scan: ${finalReport.length} files with A11y issues.`);
