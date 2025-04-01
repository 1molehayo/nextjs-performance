#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

// Setup script to create the necessary files and directories for bundle reporting
const fs = require('fs');
const path = require('path');

console.log('Setting up Next.js bundle report viewer...');

// Create directories if they don't exist
const directories = [
  'reports',
  'public',
  'public/bundle-reports'
];

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

// Write HTML file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Next.js Bundle Analysis</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header>
    <h1>Next.js Bundle Analysis Reports</h1>
    <div class="controls">
      <button id="refreshBtn">Refresh</button>
      <select id="reportSelect">
        <option value="">Loading reports...</option>
      </select>
    </div>
  </header>

  <main>
    <div class="sidebar">
      <div class="report-list-container">
        <h2>Available Reports</h2>
        <ul id="reportList" class="report-list"></ul>
      </div>
    </div>

    <div class="content">
      <div id="reportViewer">
        <div class="placeholder">Select a report to view</div>
      </div>
    </div>
  </main>

  <footer>
    <p>Next.js Bundle Analysis Tool</p>
  </footer>

  <!-- Load third-party dependencies -->
  <script src="https://unpkg.com/d3@5.16.0/dist/d3.min.js"></script>
  <script src="https://unpkg.com/webpack-bundle-analyzer@4.5.0/public/viewer.js"></script>
  
  <!-- Load our application scripts -->
  <script src="/main.js"></script>
</body>
</html>`;

fs.writeFileSync(
  path.join(process.cwd(), 'public', 'bundle-reports', 'index.html'),
  htmlContent
);
console.log('Created index.html');

// Write CSS file
const cssContent = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

header h1 {
  margin-bottom: 0.5rem;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

main {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 250px;
  background-color: #ecf0f1;
  padding: 1rem;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}

.report-list-container {
  margin-bottom: 2rem;
}

.report-list {
  list-style: none;
  margin-top: 0.5rem;
}

.report-list li {
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.2s;
}

.report-list li:hover {
  background-color: #e0e0e0;
}

.report-list li.active {
  background-color: #3498db;
  color: white;
}

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #7f8c8d;
  font-style: italic;
  background-color: #f9f9f9;
  border-radius: 4px;
}

#reportViewer {
  height: 100%;
  min-height: 500px;
}

button, select {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #2980b9;
}

select {
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
}

footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

/* Format badges and HTML report styles */
.formats {
  margin-top: 5px;
  display: flex;
  gap: 5px;
}

.format-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.format-badge.json {
  background-color: #1e88e5;
  color: white;
}

.format-badge.html {
  background-color: #43a047;
  color: white;
}

.html-report-available {
  background-color: #e3f2fd;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #2196f3;
  text-align: center;
}

.view-html-btn {
  display: inline-block;
  margin: 10px 0;
  padding: 8px 16px;
  background-color: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}

.view-html-btn:hover {
  background-color: #1976d2;
}

#interactive-viewer {
  margin-top: 20px;
  min-height: 500px;
}

.extraction-failed {
  background-color: #ffebee;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #f44336;
  text-align: center;
}

.extraction-failed p {
  margin-bottom: 10px;
}

.extraction-failed .view-html-btn {
  background-color: #f44336;
}

.extraction-failed .view-html-btn:hover {
  background-color: #d32f2f;
}

@media (max-width: 768px) {
  main {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }
}`;

fs.writeFileSync(
  path.join(process.cwd(), 'public', 'bundle-reports', 'styles.css'),
  cssContent
);
console.log('Created styles.css');

// Write JavaScript file
const jsContent = `// main.js - Client-side JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const reportList = document.getElementById('reportList');
  const reportSelect = document.getElementById('reportSelect');
  const reportViewer = document.getElementById('reportViewer');
  const refreshBtn = document.getElementById('refreshBtn');
  
  // Viewer instance to display report (from webpack-bundle-analyzer)
  let viewer = null;
  
  // Fetch and display available reports
  async function fetchReports() {
    try {
      const response = await fetch('/api/reports');
      const reports = await response.json();
      
      // Clear existing items
      reportList.innerHTML = '';
      reportSelect.innerHTML = '';
      
      if (reports.length === 0) {
        reportList.innerHTML = '<li class="no-reports">No reports available</li>';
        reportSelect.innerHTML = '<option value="">No reports available</option>';
        return;
      }
      
      // Add reports to the sidebar list
      reports.forEach(report => {
        const date = new Date(report.date).toLocaleString();
        const li = document.createElement('li');
        li.dataset.name = report.name;
        
        // Show available formats
        const formatBadges = report.formats.map(format => 
          \`<span class="format-badge \${format}">\${format}</span>\`
        ).join('');
        
        li.innerHTML = \`
          <strong>\${report.name}</strong>
          <div>Date: \${date}</div>
          <div>Size: \${formatBytes(report.size)}</div>
          <div class="formats">\${formatBadges}</div>
        \`;
        
        li.addEventListener('click', () => loadReport(report.name));
        reportList.appendChild(li);
        
        // Add reports to the dropdown
        const option = document.createElement('option');
        option.value = report.name;
        option.textContent = \`\${report.name} (\${date})\`;
        reportSelect.appendChild(option);
      });
      
      // Load the most recent report by default
      if (reports.length > 0) {
        loadReport(reports[0].name);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      reportList.innerHTML = '<li class="error">Error loading reports</li>';
    }
  }
  
  // Load and display a specific report
  async function loadReport(name) {
    try {
      // Show loading state
      reportViewer.innerHTML = '<div class="placeholder">Loading report...</div>';
      
      // Highlight the selected report in the list
      const items = reportList.querySelectorAll('li');
      items.forEach(item => {
        if (item.dataset.name === name) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      
      // Set the selected option in dropdown
      reportSelect.value = name;
      
      // Check if HTML report is available for this name
      const reportInfoResponse = await fetch('/api/reports');
      const reports = await reportInfoResponse.json();
      const report = reports.find(r => r.name === name);
      
      if (report && report.formats.includes('html')) {
        // If HTML report is available, offer a link to view it directly
        reportViewer.innerHTML = \`
          <div class="html-report-available">
            <p>An HTML report is available for this analysis.</p>
            <a href="/html-report/\${name}" target="_blank" class="view-html-btn">
              View HTML Report
            </a>
          </div>
          <div id="interactive-viewer"></div>
        \`;
      }
      
      // Fetch the JSON report data
      try {
        const response = await fetch(\`/api/reports/\${name}\`);
        const data = await response.json();
        
        // Check if data contains a note about extraction failure
        if (data.note && data.note.includes("Data extraction failed")) {
          reportViewer.innerHTML = \`
            <div class="extraction-failed">
              <p>Could not extract data for interactive visualization.</p>
              <p>Please use the HTML report instead:</p>
              <a href="/html-report/\${name}" target="_blank" class="view-html-btn">
                View HTML Report
              </a>
            </div>
          \`;
          return;
        }
        
        // Get or create the viewer container
        const viewerContainer = document.getElementById('interactive-viewer') || reportViewer;
        
        // Clear the viewer element if needed
        if (viewerContainer === reportViewer) {
          viewerContainer.innerHTML = '';
        }
        
        // Initialize or update the viewer
        if (viewer) {
          viewer.setData(data);
        } else {
          viewer = new window.BundleAnalyzerViewer(data, viewerContainer);
        }
      } catch (error) {
        // If JSON loading fails but we have HTML, provide a link to the HTML report
        if (report && report.formats.includes('html')) {
          reportViewer.innerHTML = \`
            <div class="extraction-failed">
              <p>Could not load interactive visualization: \${error.message}</p>
              <p>Please use the HTML report instead:</p>
              <a href="/html-report/\${name}" target="_blank" class="view-html-btn">
                View HTML Report
              </a>
            </div>
          \`;
        } else {
          reportViewer.innerHTML = '<div class="placeholder">Error loading report: ' + error.message + '</div>';
        }
      }
    } catch (error) {
      console.error('Error loading report:', error);
      reportViewer.innerHTML = '<div class="placeholder">Error loading report: ' + error.message + '</div>';
    }
  }
  
  // Format bytes to human-readable size
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
  
  // Check for report in URL query params
  function loadReportFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const reportName = urlParams.get('report');
    if (reportName) {
      loadReport(reportName);
    }
  }
  
  // Event listeners
  refreshBtn.addEventListener('click', fetchReports);
  
  reportSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      loadReport(e.target.value);
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('report', e.target.value);
      window.history.pushState({}, '', url);
    }
  });
  
  // Initial load
  fetchReports().then(() => {
    loadReportFromUrl();
  });
});`;

fs.writeFileSync(
  path.join(process.cwd(), 'public', 'bundle-reports', 'main.js'),
  jsContent
);
console.log('Created main.js');

// Update package.json
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = require(packageJsonPath);
  
  // Add scripts if they don't exist
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  if (!packageJson.scripts.analyze) {
    packageJson.scripts.analyze = 'ANALYZE=true next build';
    console.log('Added analyze script to package.json');
  }
  
  if (!packageJson.scripts['serve-reports']) {
    packageJson.scripts['serve-reports'] = 'node bundle-report-server.js';
    console.log('Added serve-reports script to package.json');
  }
  
  // Write updated package.json
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2)
  );
  console.log('Updated package.json');
} catch (error) {
  console.error('Error updating package.json:', error);
}

console.log('\nSetup complete!');
console.log('To generate reports, run: npm run analyze');
console.log('To view reports, run: npm run serve-reports');
console.log('Then open http://localhost:3001 in your browser');