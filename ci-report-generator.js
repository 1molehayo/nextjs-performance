/* eslint-disable @typescript-eslint/no-require-imports */
// ci-report-generator.js - Script for CI/CD environments
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extract webpack stats data from an HTML report
function extractStatsFromHtml(htmlPath) {
  console.log(`Extracting stats data from HTML report: ${htmlPath}`);
  
  // Read the HTML file
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // Try different patterns that might be found in the HTML
  let dataMatch;
  let jsonData;
  
  // Pattern 1: window.chartData = {...};
  dataMatch = html.match(/window\.chartData\s*=\s*(\{[\s\S]*?\});/);
  if (dataMatch && dataMatch[1]) {
    console.log("Found data with window.chartData pattern");
    jsonData = dataMatch[1];
  }
  
  // Pattern 2: var chartData = {...};
  if (!jsonData) {
    dataMatch = html.match(/var\s+chartData\s*=\s*(\{[\s\S]*?\});/);
    if (dataMatch && dataMatch[1]) {
      console.log("Found data with var chartData pattern");
      jsonData = dataMatch[1];
    }
  }
  
  // Pattern 3: Next.js specific format: var stats = {...} or var data = {...};
  if (!jsonData) {
    dataMatch = html.match(/var\s+(stats|data|webjackData)\s*=\s*(\{[\s\S]*?\});/);
    if (dataMatch && dataMatch[2]) {
      console.log(`Found data with var ${dataMatch[1]} pattern`);
      jsonData = dataMatch[2];
    }
  }
  
  // Pattern 4: Looking for any JSON-like structure in a script tag
  if (!jsonData) {
    dataMatch = html.match(/<script[^>]*>[\s\S]*?(\{[\s\S]*?"assets"[\s\S]*?\})[\s\S]*?<\/script>/);
    if (dataMatch && dataMatch[1]) {
      console.log("Found data within script tag");
      jsonData = dataMatch[1];
    }
  }
  
  if (!jsonData) {
    // If we can't extract the data, create a minimal compatible structure
    console.log("Could not extract data from HTML. Creating minimal compatible structure.");
    
    // Create a placeholder stats object that's compatible with the viewer
    const fileName = path.basename(htmlPath, '.html');
    
    return {
      assets: [
        {
          name: fileName,
          size: fs.statSync(htmlPath).size,
          parsedSize: 0,
          gzipSize: 0
        }
      ],
      source: "Next.js Bundle Analyzer (HTML Report)",
      htmlPath: htmlPath
    };
  }
  
  try {
    // Clean up the JSON string and parse it
    const cleanJsonStr = jsonData.replace(/undefined/g, 'null').replace(/NaN/g, 'null');
    const statsData = JSON.parse(cleanJsonStr);
    return statsData;
  } catch (error) {
    console.error('Error parsing extracted stats data:', error);
    
    // Rather than failing completely, return a minimal compatible object
    // and indicate there was an issue with parsing
    return {
      assets: [],
      errors: ['Error parsing stats data from HTML report'],
      htmlPath: htmlPath
    };
  }
}

// Configuration
const config = {
  // Output directory for reports
  reportsDir: process.env.REPORTS_DIR || path.resolve(__dirname, 'reports'),
  
  // Command to generate the stats.json file - Next.js specific
  statsCommand: 'ANALYZE=true npm run build',
  
  // Path to your webpack stats file - Next.js creates these files in this location
  statsFile: process.env.STATS_FILE || '.next/stats.json',
  
  // Alternative stats file locations to check
  alternativeStatsFiles: [
    '.next/analyze/client.json',   // Client bundles
    '.next/analyze/server.json',   // Server bundles
    '.next/analyze/client.html',   // Client bundles HTML
    '.next/analyze/edge.html',     // Edge bundles HTML
    '.next/analyze/nodejs.html'    // Node.js bundles HTML
  ],
  
  // Report name format (default: branch-commit-timestamp)
  reportNameFormat: '{branch}-{commit}-{timestamp}'
};

// Ensure reports directory exists
if (!fs.existsSync(config.reportsDir)) {
  fs.mkdirSync(config.reportsDir, { recursive: true });
  console.log(`Created reports directory: ${config.reportsDir}`);
}

// Get git information
function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const commit = execSync('git rev-parse --short HEAD').toString().trim();
    return { branch, commit };
  } catch (error) {
    console.warn('Warning: Unable to get git info. Using defaults.', error.message);
    return { branch: 'unknown', commit: 'unknown' };
  }
}

// Generate unique report name
function generateReportName() {
  const { branch, commit } = getGitInfo();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return config.reportNameFormat
    .replace('{branch}', branch)
    .replace('{commit}', commit)
    .replace('{timestamp}', timestamp);
}

// Find the appropriate stats file or HTML report
function findStatsFile() {
  // First check the primary stats file location
  if (fs.existsSync(config.statsFile)) {
    return { path: config.statsFile, type: 'json' };
  }
  
  // Then check alternative locations
  for (const altFile of config.alternativeStatsFiles) {
    if (fs.existsSync(altFile)) {
      console.log(`Found file at location: ${altFile}`);
      const isHtml = altFile.endsWith('.html');
      return { path: altFile, type: isHtml ? 'html' : 'json' };
    }
  }
  
  // If no existing files found, generate them
  console.log('No stats files found. Generating using Next.js build...');
  try {
    execSync(config.statsCommand, { stdio: 'inherit' });
    
    // Check again for the files after generation
    if (fs.existsSync(config.statsFile)) {
      return { path: config.statsFile, type: 'json' };
    }
    
    // Check for HTML reports first (Next.js typically generates these)
    const htmlReports = config.alternativeStatsFiles.filter(file => file.endsWith('.html'));
    for (const htmlReport of htmlReports) {
      if (fs.existsSync(htmlReport)) {
        console.log(`Build generated HTML report at: ${htmlReport}`);
        return { path: htmlReport, type: 'html' };
      }
    }
    
    // Then check for JSON files
    const jsonFiles = config.alternativeStatsFiles.filter(file => file.endsWith('.json'));
    for (const jsonFile of jsonFiles) {
      if (fs.existsSync(jsonFile)) {
        console.log(`Build generated JSON file at: ${jsonFile}`);
        return { path: jsonFile, type: 'json' };
      }
    }
    
    throw new Error('Failed to find stats file or HTML report after build');
  } catch (error) {
    console.error('Error during build:', error.message);
    process.exit(1);
  }
}

// Main function to generate report
function generateReport() {
  console.log('Starting bundle analysis report generation...');
  
  // Find the stats file or HTML report
  const statsFile = findStatsFile();
  console.log(`Using ${statsFile.type} file: ${statsFile.path}`);
  
  // Generate a unique report name
  const reportName = generateReportName();
  
  // Get the stats data
  let statsData;
  let extractionSuccess = true;
  
  if (statsFile.type === 'html') {
    try {
      // Extract data from HTML report
      const extractedData = extractStatsFromHtml(statsFile.path);
      statsData = JSON.stringify(extractedData, null, 2);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.warn('Warning: Could not extract stats data from HTML. Will still copy the HTML report.');
      statsData = JSON.stringify({
        note: "Data extraction failed. Please view the HTML report directly.",
        htmlReportAvailable: true,
        timestamp: new Date().toISOString()
      }, null, 2);
      extractionSuccess = false;
    }
  } else {
    // Read the JSON file directly
    statsData = fs.readFileSync(statsFile.path, 'utf8');
  }
  
  // Save the JSON report
  const reportPath = path.join(config.reportsDir, `${reportName}.json`);
  fs.writeFileSync(reportPath, statsData);
  console.log(`Bundle analysis report saved to: ${reportPath}`);
  
  // Always copy the HTML report if available
  if (statsFile.type === 'html') {
    const htmlReportPath = path.join(config.reportsDir, `${reportName}.html`);
    fs.copyFileSync(statsFile.path, htmlReportPath);
    console.log(`HTML report saved to: ${htmlReportPath}`);
  }
  
  return {
    reportName,
    reportPath,
    htmlReportPath: statsFile.type === 'html' ? path.join(config.reportsDir, `${reportName}.html`) : null,
    dataExtractionSuccess: extractionSuccess,
    timestamp: new Date().toISOString()
  };
}

// Execute if run directly
if (require.main === module) {
  try {
    const result = generateReport();
    console.log('Report generation successful!');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

module.exports = { generateReport };