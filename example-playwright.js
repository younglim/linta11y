const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright'); 
const { scanDir } = require('./npmIndex'); // In your project: require('linta11y')

// Usage: node example-playwright.js

(async () => {
    console.log('🚀 Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // 1. Navigate to your target page
        const targetUrl = 'https://www.w3.org/WAI/demos/bad/before/home.html';
        console.log(`🌍 Navigating to: ${targetUrl}`);
        await page.goto(targetUrl);
        
        // 2. Snapshot the current DOM state to a string
        const htmlContent = await page.content();
        
        // 3. Write that HTML to a temporary file
        const tempFilePath = path.join(__dirname, 'temp-scan.html');
        fs.writeFileSync(tempFilePath, htmlContent);

        console.log('📸 DOM snapshot saved to:', tempFilePath);

        // 4. Run linta11y on that single file
        const report = await scanDir(tempFilePath, { 
            generateReports: true, // We just want the JSON object back
            oobee: true 
        });

        console.log(`\n🔍 Accessibility Violations Found: \n${JSON.stringify(report.violations, null, 2)}`);

        // 5. Clean up the temp file immediately (optional)
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        // 6. Assert or log results
        if (report.violations.length > 0) {
            console.error('⚠️  Accessibility checks failed! See violations above.');
            process.exit(1); 
        } else {
            console.log('✅ No violations found.');
        }

    } catch (err) {
        console.error('❌ Script failed:', err);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
