# linta11y

**Tally accessibility issues by linting remote repositories.**

## 📖 What is this?

`linta11y` is a **Universal Accessibility Scanner** designed to perform static analysis on remote codebases. Unlike dynamic scanners (which check the rendered DOM in a browser), `linta11y` analyzes the **source code** directly.

It uses a "Golden Set" of linting engines to detect accessibility violations, bad practices, and missing attributes across almost any modern frontend framework. It normalizes these findings into a single JSON report and maps specific technical failures to **WCAG 2.1** compliance clauses.

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
| **Dynamic HTML (Optional)** | **Oobee** (Custom rules) | Mapped if Oobee rule IDs are present |

---

## 🎯 Test Repositories & Benchmarks

The following repositories are curated for testing the scanner across different technologies.

> **⚠️ Note for Testers:** When scanning these repositories, look for branches named `start`, `exercise`, or `get-started`. The `main` branch often contains the "fixed" code and may return 0 results.

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

## 🐝 Oobee (Optional HTML Scan)

If you run Oobee separately, place its JSON output at `oobee-raw.json` before generating reports.  
Mapped Oobee rule IDs will be included in the final report.

## 🧰 Global CLI

Install globally and run from any folder (expects `./target-code` to exist):

```bash
npm i -g linta11y
linta11y
```

## Usage

```bash
linta11y
```

## Oobee (local HTML/HTM files)

```bash
linta11y --oobee
# scans .html/.htm files under the target directory (default: ./target-code or cwd)
```

## Oobee (optional)

```bash
linta11y --oobee --oobee-url https://example.com
# or: linta11y --oobee (if target/index.html exists)
```

## Run ESLint-only:

```bash
linta11y
```

## Run ESLint + Oobee (writes `oobee-raw.json`):

```bash
linta11y --oobee
```

## Oobee (local HTML/HTM via sitemap)

```bash
linta11y --oobee --debug
# builds a local sitemap from .html/.htm files and scans it once
# local sitemap uses file:// URLs
```

## Troubleshooting

If this runs inside another repo, it does **not** install that repo’s dependencies.  
The previous failure came from `npm install` in the target repo (e.g., `node-sass` + missing Python).

### Debug Usage

```bash
linta11y --debug
# shows detailed information about the scan process
```

