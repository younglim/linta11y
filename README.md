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

## 🧰 Global CLI

Install globally and run from any folder (expects `./target-code` to exist):

```bash
npm i -g linta11y
linta11y
```

