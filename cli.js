#!/usr/bin/env node
const { execSync } = require('node:child_process');
const { existsSync } = require('node:fs');

const cmd = 'npx eslint "./target-code/**/*.{js,jsx,ts,tsx,vue,html}" --config eslint.config.js --format json --output-file eslint-raw.json';

try {
  if (existsSync('package.json')) {
    execSync('npm install', { stdio: 'inherit' });
  }
  execSync(cmd, { stdio: 'inherit' });
} catch (e) {
  process.exitCode = 1;
}
