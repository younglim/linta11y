const fs = require('fs');

const REPORT_FILE = 'accessibility-report.json';
const OUTPUT_FILE = 'accessibility-report.html';

// Load Data (Robust handling)
let reportData = { metadata: {}, violations: [] };
try {
  if (fs.existsSync(REPORT_FILE)) {
    reportData = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
  }
} catch (e) {
  console.error("Error reading report:", e);
}

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report</title>
  <style>
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --text: #334155;
      --heading: #0f172a;
      --border: #e2e8f0;
      --primary: #2563eb;
      --error: #ef4444;
      --chip-bg: #e0f2fe;
      --chip-text: #0369a1;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 2rem;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    /* HEADER */
    header {
      background: var(--surface);
      padding: 2rem;
      border-radius: 12px;
