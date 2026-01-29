const fs = require('fs');

const ruleMap = {
  // CSS RULES
  'a11y/no-outline-none': 'WCAG 2.4.7 (Focus Visible)',
  'a11y/selector-pseudo-class-focus': 'WCAG 2.4.7 (Focus Visible)',
  'a11y/content-property-no-static-value': 'WCAG 1.3.1 (Info and Relationships)',
  'a11y/media-prefers-reduced-motion': 'WCAG 2.3.3 (Animation from Interactions)',
  'a11y/no-text-align-justify': 'WCAG 1.4.8 (Visual Presentation)',

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
   if (!fs.existsSync(path)) return [];
   try { return JSON.parse(fs.readFileSync(path, 'utf8')); } 
   catch (e) { return []; }
};

const eslintRaw = loadJSON('eslint-raw.json');
const stylelintRaw = loadJSON('stylelint-raw.json');

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

const finalReport = allFiles.map(f => {
   const validMsgs = f.messages.filter(m => ruleMap[m.ruleId]);
   if (validMsgs.length === 0) return null;

   f.filePath = f.filePath.split('/target-code/')[1] || f.filePath;
   f.messages = validMsgs.map(m => ({
     ...m,
     wcagClause: ruleMap[m.ruleId]
   }));
   return f;
}).filter(Boolean);

fs.writeFileSync('accessibility-report.json', JSON.stringify(finalReport, null, 2));
console.log(`✅ Total Code Scan: ${finalReport.length} files with A11y issues.`);
