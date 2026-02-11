#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const cwd = process.cwd();
const pkgRoot = path.resolve(__dirname);

const args = process.argv.slice(2);
const getArg = (flag) => {
	const i = args.indexOf(flag);
	return i >= 0 ? args[i + 1] : undefined;
};

const debug = args.includes('--debug') || process.env.LINTA11Y_DEBUG === '1';
const log = (...m) => console.log('[linta11y]', ...m);
const debugLog = (...m) => { if (debug) console.log('[linta11y:debug]', ...m); };

const targetFlagIndex = args.findIndex(a => a === '--target' || a === '-t');
const targetDir = targetFlagIndex >= 0 && args[targetFlagIndex + 1]
	? path.resolve(cwd, args[targetFlagIndex + 1])
	: (fs.existsSync(path.join(cwd, 'target-code')) ? path.join(cwd, 'target-code') : cwd);

const runOobee = args.includes('--oobee') || process.env.LINTA11Y_OOBEE === '1';
const sitemapPath = path.resolve(cwd, getArg('--oobee-sitemap') || '.oobee-sitemap.xml');

const eslintBin = path.join(pkgRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'eslint.cmd' : 'eslint');
const eslintConfig = path.join(pkgRoot, 'eslint.config.js');
const outputFile = path.join(cwd, 'eslint-raw.json');
const oobeeRawFile = path.join(cwd, 'oobee-raw.json');

const toPosix = (p) => p.split(path.sep).join('/');
const targetGlob = `${toPosix(targetDir)}/**/*.{js,jsx,ts,tsx,vue,html,htm}`;

const runEslint = () => {
	if (!fs.existsSync(eslintBin)) {
		log('ESLint binary not found. Skipping ESLint.');
		return 0;
	}
	debugLog('ESLint target glob:', targetGlob);
	const result = spawnSync(eslintBin, [
		targetGlob,
		'--config', eslintConfig,
		'--format', 'json',
		'--output-file', outputFile,
		'--no-error-on-unmatched-pattern'
	], {
		stdio: 'inherit',
		cwd: pkgRoot,
		env: process.env
	});
	return result.status ?? 1;
};

const collectHtmlFiles = (root) => {
	const out = [];
	const walk = (dir) => {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const e of entries) {
			if (e.name === 'node_modules' || e.name === '.git') continue;
			const full = path.join(dir, e.name);
			if (e.isDirectory()) walk(full);
			else if (/\.(html|htm)$/i.test(e.name)) out.push(full);
		}
	};
	walk(root);
	return out;
};

const findFileRecursive = (dir, filename) => {
	if (!fs.existsSync(dir)) return null;
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const e of entries) {
		const full = path.join(dir, e.name);
		if (e.isDirectory()) {
			const found = findFileRecursive(full, filename);
			if (found) return found;
		} else if (e.isFile() && e.name === filename) {
			return full;
		}
	}
	return null;
};

const runOobeeBatchScan = async (htmlFiles) => {
	const { scanHTML } = await import(path.join(pkgRoot, 'node_modules', '@govtechsg', 'oobee', 'dist', 'npmIndex.js'));
	const batchSize = Math.max(1, Number.parseInt(process.env.LINTA11Y_OOBEE_BATCH_SIZE || '100', 10) || 100);
	const allResults = [];
	for (let i = 0; i < htmlFiles.length; i += batchSize) {
		const batchFiles = htmlFiles.slice(i, i + batchSize);
		const htmlStrings = batchFiles.map((f) => fs.readFileSync(f, 'utf8'));
		debugLog(`Scanning batch ${Math.floor(i / batchSize) + 1} (${batchFiles.length} files)`);
		const results = await scanHTML(htmlStrings, {
			name: 'GovTech A11y Team',
			email: 'lim_zui_young@tech.gov.sg'
		});
		allResults.push(results);
	}
	fs.writeFileSync(oobeeRawFile, JSON.stringify(allResults.length === 1 ? allResults[0] : allResults, null, 2));
	log('Oobee raw results written:', oobeeRawFile);
};

const runReportScripts = () => {
	const mapScript = path.join(pkgRoot, 'map-wcag.js');
	const htmlScript = path.join(pkgRoot, 'generate-html.js');
	let code = 0;
	if (fs.existsSync(mapScript)) {
		const r = spawnSync('node', [mapScript], { stdio: 'inherit', cwd, env: process.env });
		code = code || (r.status ?? 1);
	}
	if (fs.existsSync(htmlScript)) {
		const r = spawnSync('node', [htmlScript], { stdio: 'inherit', cwd, env: process.env });
		code = code || (r.status ?? 1);
	}
	return code;
};

const main = async () => {
	log('Target dir:', targetDir);
	let exitCode = runEslint();

	if (runOobee) {
		const htmlFiles = collectHtmlFiles(targetDir);
		log('HTML files found:', htmlFiles.length);
		debugLog('Sample HTML files:', htmlFiles.slice(0, 5));
		if (htmlFiles.length === 0) {
			log('Skipping Oobee: no .html/.htm files found.');
			process.exit(exitCode);
		}
		try {
			await runOobeeBatchScan(htmlFiles);
		} catch (err) {
			console.error(err);
			exitCode = exitCode || 1;
		}
	}
	log('Generating reports...');
	const reportExit = runReportScripts();
	if (reportExit) log('Report generation failed with code', reportExit);
	log('Report JSON:', path.join(cwd, 'accessibility-report.json'));
	log('Report HTML:', path.join(cwd, 'accessibility-report.html'));
	exitCode = exitCode || reportExit;
	process.exit(exitCode);
};

main();
