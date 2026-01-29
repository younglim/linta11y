const fs = require('fs');

const ruleMap = {
  // CSS RULES (From your logs)
  'alpha-value-notation': 'Best Practice (Modern CSS)',
  'color-function-notation': 'Best Practice (Modern CSS)',
  'property-no-vendor-prefix': 'Best Practice (Clean Code)',
  'scss/no-global-function-names': 'Best Practice (Modern SCSS)',
  'declaration-empty-line-before': 'Best Practice (Readability)',
  
  // The crucial A11y rules we want to catch
  'declaration-property-value-disallowed-list': 'WCAG 2.4.7 (Focus Visible)',
  'font-family-no-missing-generic-family-keyword': 'Best Practice (Fallback Fonts)',
  'unit-no-unknown': 'Best Practice (Valid CSS)',

  // ANGULAR
  '@angular-eslint/template/alt-text': 'WCAG 1.1.1 (Non-text Content)',
  '@angular-eslint/template/elements-content': 'WCAG 1.3.1 (Info and Relationships)',
  '@angular-eslint/template/valid-aria': 'WCAG 4.1.2 (Name, Role, Value)',
  '@angular-eslint/template/click-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  '@angular-eslint/template/mouse-events-have-key-events': 'WCAG 2.1.1 (Keyboard)',
  '@angular-eslint/template/label-has-associated-control': 'WCAG 1.3.1 (Info and Relationships)',
  '@angular-eslint/template/role-has-required-aria': 'WCAG 4.1.2 (Name, Role, Value)',

  // REACT / VUE / HTML
  'jsx-a11y/alt-text': 'WCAG 1.1.1',
  'jsx-a11y/anchor-has-content': 'WCAG 2.4.4',
  'jsx-a11y/click-events-have-key-events': 'WCAG 2.1.1',
  'jsx-a11y/label-has-associated-control': 'WCAG 1.3.1',
  'react-native-a11y/accessibility-label': 'WCAG 1.1.1',
  'vuejs-accessibility/alt-text': 'WCAG 1.1.1',
  'vuejs-accessibility/form-control-has-label': 'WCAG 1.3.1'
};

const loadJSON = (path) => {
   if (!fs.existsSync(path)) { console.log(`Skipping ${path}: Not found`); return []; }
   try { return JSON.parse(fs.readFileSync(path, 'utf8')); } 
   catch (e) { console.log(`Skipping ${path}: Invalid JSON`); return []; }
};

// ... (Rest of the script remains the same)
