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

