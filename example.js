const { scanDir } = require('./npmIndex');
const path = require('path');

async function main() {
    // Get directory from command line args, default to current working directory
    const inputPath = process.argv[2] || process.cwd();
    const resolvedPath = path.resolve(inputPath);

    console.log(`🚀 Starting scan on: ${resolvedPath}`);

    try {
        const report = await scanDir(resolvedPath, {
            recursive: true,      // Scan subdirectories
            omitDotFiles: true,   // Skip .git, etc
            generateReports: true // Write accessibility-report.json to disk
        });

        console.log('\n📊 Scan Summary:');
        console.log(`Files with violations: ${report.violations.length}`);
        
        if (report.oobeeSummary) {
            console.log('HTML (Oobee) Issues:');
            console.log(`  Must Fix: ${report.oobeeSummary.mustFix.totalItems}`);
            console.log(`  Good to Fix: ${report.oobeeSummary.goodToFix.totalItems}`);
        }

        console.log(`\n✅ Done! Report metadata branch: ${report.metadata.branch}`);

    } catch (error) {
        console.error('❌ Scan failed:', error);
        process.exit(1);
    }
}

main();
