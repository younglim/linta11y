const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, exec } = require('node:child_process');
const util = require('node:util');
const execPromise = util.promisify(exec);
const { generateReport } = require('./map-wcag');

const pkgRoot = __dirname;
const eslintBin = path.join(pkgRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'eslint.cmd' : 'eslint');
const stylelintConfigPath = path.join(pkgRoot, '.stylelintrc.json');
const eslintConfigPath = path.join(pkgRoot, 'eslint.config.js');

const toPosix = (p) => p.split(path.sep).join('/');

async function scanDir(targetPathArg, options = {}) {
    // Default options
    const {
        recursive = true,
        omitDotFiles = true,
        generateReports = true
    } = options;

    const targetPath = path.resolve(targetPathArg || process.cwd());
    const isFile = fs.statSync(targetPath).isFile();
    const targetDir = isFile ? path.dirname(targetPath) : targetPath;
    
    // --- 1. ESLint Execution ---
    let eslintResults = [];
    if (fs.existsSync(eslintBin)) {
        let pattern;
        if (isFile) {
            pattern = toPosix(targetPath);
        } else {
            const ext = '.{js,jsx,ts,tsx,vue,html,htm}';
            pattern = recursive 
                ? `${toPosix(targetDir)}/**/${ext}`
                : `${toPosix(targetDir)}/*${ext}`;
        }
        
        try {
            const result = spawnSync(eslintBin, [
                pattern,
                '--config', eslintConfigPath,
                '--format', 'json',
                '--no-error-on-unmatched-pattern'
            ], {
                cwd: pkgRoot,
                env: process.env,
                encoding: 'utf8',
                maxBuffer: 1024 * 1024 * 10 
            });
            
            if (result.stdout) {
               try { eslintResults = JSON.parse(result.stdout); } catch (e) {}
            }
        } catch (e) {
            console.error('ESLint execution failed', e);
        }
    }

    // --- 2. Stylelint Execution ---
    let stylelintResults = [];
    try {
        let pattern;
        if (isFile) {
            pattern = `"${targetPath}"`;
        } else {
            const ext = '{css,scss,sass,less,vue}';
            pattern = recursive 
                ? `"${targetDir}/**/*.{${ext}}"`
                : `"${targetDir}/*.{${ext}}"`;
        }
        
        const relativeConfigPath = path.relative(process.cwd(), stylelintConfigPath);
        const stylelintExec = path.join(pkgRoot, 'node_modules', '.bin', 'stylelint');
        
        const { stdout } = await execPromise(`"${stylelintExec}" ${pattern} --config "${relativeConfigPath}" --formatter json`);
        stylelintResults = JSON.parse(stdout);
    } catch (error) {
        if (error.stdout) {
            try { stylelintResults = JSON.parse(error.stdout); } catch (e) {}
        }

        // Handle "No files matching the pattern" gracefullly
        if (stylelintResults.length === 0) {
            const errorMsg = error.stderr || error.message || '';
            if (!errorMsg.includes('No files matching the pattern')) {
                console.error('Stylelint execution failed:', error);
            }
        }
    }

    // --- 3. Oobee Execution ---
    let oobeeResults = [];
    const htmlFiles = [];
    
    if (isFile) {
        if (/\.(html|htm)$/i.test(targetPath)) htmlFiles.push(targetPath);
    } else {
        const walk = (dir) => {
            let entries;
            try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
            for (const e of entries) {
                if (omitDotFiles && e.name.startsWith('.')) continue;
                if (e.name === 'node_modules') continue;
                
                const full = path.join(dir, e.name);
                if (e.isDirectory()) {
                    if (recursive) walk(full);
                } else if (/\.(html|htm)$/i.test(e.name)) {
                    htmlFiles.push(full);
                }
            }
        };
        walk(targetDir);
    }

    if (htmlFiles.length > 0) {
        try {
            const { scanHTML } = await import(path.join(pkgRoot, 'node_modules', '@govtechsg', 'oobee', 'dist', 'npmIndex.js'));
            const batchSize = 100;
            for (let i = 0; i < htmlFiles.length; i += batchSize) {
                const batchFiles = htmlFiles.slice(i, i + batchSize);
                const htmlStrings = batchFiles.map(f => fs.readFileSync(f, 'utf8'));
                
                const results = await scanHTML(htmlStrings, {
                    name: 'GovTech A11y Team',
                    email: 'accessibility@tech.gov.sg'
                });

                // Fix URLs logic
                const fixUrl = (obj, key) => {
                    if (obj && typeof obj[key] === 'string') {
                        const match = obj[key].match(/^raw-html-(\d+)$/);
                        if (match) {
                            const idx = parseInt(match[1], 10) - 1;
                            if (idx >= 0 && idx < batchFiles.length) {
                                obj[key] = batchFiles[idx];
                            }
                        }
                    }
                };
                
                ['mustFix', 'goodToFix', 'needsReview'].forEach(category => {
                    if (results[category] && results[category].rules) {
                        Object.values(results[category].rules).forEach(rule => {
                            if (Array.isArray(rule.items)) {
                                rule.items.forEach(item => fixUrl(item, 'url'));
                            }
                        });
                    }
                });

                if (Array.isArray(results.pages)) {
                    results.pages.forEach(p => {
                        fixUrl(p, 'url'); fixUrl(p, 'pageUrl');
                    });
                }
                oobeeResults.push(results);
            }
        } catch (e) {
            console.error("Oobee failed", e);
        }
    }
    
    // Flatten single result if needed for map-wcag compatibility
    const oobeeRaw = oobeeResults.length === 1 ? oobeeResults[0] : oobeeResults;

    // --- 4. Generate Report ---
    const metadata = {
        repositoryUrl: 'Local Scan',
        branch: 'N/A',
        scanDate: new Date().toLocaleString(),
        commitHash: 'N/A',
        reportGeneratedAt: new Date().toISOString()
    };
    
    const finalReport = generateReport(eslintResults, stylelintResults, oobeeRaw, { 
        metadata,
        log: false 
    });

    // --- 5. Write outputs if requested ---
    if (generateReports) {
        const reportPath = path.join(process.cwd(), 'accessibility-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
        
        // Attempt to run HTML generator if it exists (legacy support)
        const htmlScript = path.join(pkgRoot, 'generate-html.js');
        if (fs.existsSync(htmlScript)) {
            spawnSync('node', [htmlScript], { stdio: 'ignore', cwd: process.cwd() });
        }
    }

    return finalReport;
}

module.exports = { scanDir };
