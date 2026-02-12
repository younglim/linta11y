# LintA11y

A comprehensive accessibility linter aggregating results from ESLint (React/Angular/Vue/RN), Stylelint (CSS), and Oobee (HTML).

## CLI Usage

You can run the linter directly from the command line.

```bash
# Scan current directory (or ./target-code if it exists)
node cli.js

# Scan a specific directory
node cli.js --target ./my-project/src

# Disable HTML scanning (Oobee)
node cli.js --no-oobee

# Enable debug logging
node cli.js --debug
```

### Options

| Flag | Alias | Description |
|------|-------|-------------|
| `--target` | `-t` | Directory to scan. Defaults to `./target-code` or current working directory. |
| `--no-oobee` | | Disable extensive HTML scanning using Oobee (Enabled by default). |
| `--debug` | | Enable verbose logging for debugging purposes. |

## Programmatic Usage (Node.js API)

You can import the scanner into your own Node.js scripts using the exported `scanDir` function.

```javascript
const { scanDir } = require('./npmIndex');
const path = require('path');

async function runScan() {
    const targetDir = path.resolve(__dirname, 'src');

    try {
        const report = await scanDir(targetDir, {
            // Options (defaults shown)
            recursive: true,       // Scan subdirectories
            omitDotFiles: true,    // Skip .git, .env, etc.
            generateReports: true  // Write accessibility-report.json/html to disk
        });

        console.log(`Scan complete. Found ${report.violations.length} violations.`);
        
        // Access raw data
        // console.log(report.metadata);
        // console.log(report.oobeeSummary);
    } catch (err) {
        console.error('Scan failed:', err);
    }
}

runScan();
```

### API Reference

#### `scanDir(path, options)`

Returns a Promise that resolves to the Report Object.

- **path** (`string`): The file or directory path to scan.
- **options** (`object`):
  - `recursive` (`boolean`): If false, only scans the immediate directory. Default: `true`.
  - `omitDotFiles` (`boolean`): If true, ignores files starting with `.`. Default: `true`.
  - `generateReports` (`boolean`): If true, generates `accessibility-report.json` and `accessibility-report.html` in the current working directory. Default: `true`.

#### Integration with E2E Tools (Playwright/Puppeteer)

Since `linta11y` scans files on disk, you cannot pass a live Page object directly. Instead, grasp the current DOM snapshot, save it to a temporary `.html` file, and then run `scanDir`.

**Prerequisite:** Ensure you have Playwright installed:
```bash
npm install -D playwright
```

See **[example-playwright.js](./example-playwright.js)** for a complete working example of how to:
1. Snapshot the DOM from a running browser.
2. Save it to a temporary file.
3. Run the scan programmatically.
4. Clean up afterwards.

## 🛠 Supported Frameworks & Languages

This project runs a multi-engine scan supporting the following technologies:

| Category | Supported Tech | Engine / Plugins Used |
| --- | --- | --- |
| **Web Frameworks** | **React** (`.jsx`, `.tsx`) | `eslint-plugin-jsx-a11y`, `eslint-plugin-react` |
|  | **Vue.js** (`.vue`) | `eslint-plugin-vuejs-accessibility` |
|  | **Angular** (`.html`, `.ts`) | `@angular-eslint/template/accessibility` |
| **Mobile** | **React Native** | `eslint-plugin-react-native-a11y` |
| **Core Web** | **HTML** (Raw/Static) | `@html-eslint` |
| **Styles** | **CSS, SCSS, SASS, LESS** | `stylelint-a11y` (Checks for `outline: 0`, contrast, etc.) |

---

## 🎯 Test Repositories

The following repositories are curated for testing the scanner across different technologies.

> **⚠️ Note for Testers:** When scanning these repositories, look for branches with the accessibility issues. The `main` branch often contains the "fixed" code and may return 0 results.

### 1. Mobile & Native

* **[Lemoncode/react-native-accessibility](https://github.com/Lemoncode/react-native-accessibility)**
* **Why it's a good test:** This repo is specific to **Mobile Accessibility**.

### 2. Vue.js Ecosystem

* **[vueschool/accessibility-fundamentals](https://github.com/vueschool/accessibility-fundamentals)**
* **Why it's a good test:** Created for an educational course, this codebase demonstrates common pitfalls in **Vue templates**.

### 3. The "Gold Standard" (HTML)

* **[alphagov/accessibility-tool-audit](https://github.com/alphagov/accessibility-tool-audit)**
* **Why it's a good test:** Maintained by the UK Government Digital Service (GDS), this is a massive collection of raw HTML files specifically designed to test automated scanners.

### 4. React Patterns

* **[reactjs/react-a11y](https://github.com/reactjs/react-a11y)** & **[marcysutton/js-a11y-workshop](https://github.com/marcysutton/js-a11y-workshop)**
* **Why they are good tests:** Marcy Sutton is a leading expert in the field. Her workshop repo moves beyond basic HTML tags and introduces complex **JavaScript interaction bugs**.

### 5. Angular Architecture

* **[googlecodelabs/angular-accessibility](https://github.com/googlecodelabs/angular-accessibility)**
* **Why it's a good test:** This is Google's official workshop. It creates a "broken" shop application to demonstrate Angular-specific accessibility APIs.
* **Target Branch:** Scan the `get-started` branch.

### 6. Visual & CSS Failures

* **[5t3ph/a11y-fails](https://github.com/5t3ph/a11y-fails)**
* **Why it's a good test:** Most accessibility scanners only look at HTML structure. This repo focuses on **CSS/Visual failures** that require a stylesheet parser.
