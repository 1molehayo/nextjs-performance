/* eslint-disable @typescript-eslint/no-require-imports */
// direct-html-server.js - Server that directly offers HTML reports
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = process.env.BUNDLE_REPORT_PORT || 3001;
const REPORTS_DIR = path.join(__dirname, 'reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  console.log(`Created reports directory: ${REPORTS_DIR}`);
}

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Parse the URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  console.log(`Received request: ${pathname}`);
  
  // Default route serves index.html
  if (pathname === '/' || pathname === '/index.html') {
    serveReportsIndex(res);
    return;
  }
  
  // API endpoint to list all reports
  if (pathname === '/api/reports') {
    try {
      const files = fs.readdirSync(REPORTS_DIR);
      const reportMap = {};
      
      files.forEach(file => {
        if (!file.endsWith('.html')) {
          return; // Only care about HTML reports
        }
        
        const stats = fs.statSync(path.join(REPORTS_DIR, file));
        const baseName = path.basename(file, '.html');
        
        reportMap[baseName] = {
          name: baseName,
          date: stats.mtime,
          size: stats.size
        };
      });
      
      const reports = Object.values(reportMap).sort((a, b) => b.date - a.date);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(reports));
      return;
    } catch (error) {
      console.error('Error reading reports directory:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to list reports' }));
      return;
    }
  }
  
  // HTML report viewer
  if (pathname.startsWith('/report/')) {
    const reportName = pathname.substring('/report/'.length);
    const htmlPath = path.join(REPORTS_DIR, `${reportName}.html`);
    
    console.log(`Looking for HTML report at: ${htmlPath}`);
    
    if (fs.existsSync(htmlPath)) {
      fs.readFile(htmlPath, (err, content) => {
        if (err) {
          console.error(`Error reading HTML report: ${err.message}`);
          res.writeHead(500);
          res.end('Error loading HTML report');
          return;
        }
        
        console.log(`Serving HTML report: ${reportName}.html (${content.length} bytes)`);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
      return;
    } else {
      console.log(`HTML report not found: ${htmlPath}`);
      res.writeHead(404);
      res.end('Report not found');
      return;
    }
  }
  
  // Handle any other request
  res.writeHead(404);
  res.end('Not found');
});

// Function to serve the reports index page
function serveReportsIndex(res) {
  const indexHtml = generateReportsIndexHtml();
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(indexHtml);
}

// Function to generate the reports index HTML
function generateReportsIndexHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Next.js Bundle Reports</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 20px; 
      line-height: 1.6; 
      color: #333;
      background-color: #f5f5f5;
    }
    h1 { 
      color: #333; 
      margin-bottom: 20px; 
      padding-bottom: 10px;
      border-bottom: 1px solid #ddd;
    }
    ul { 
      list-style-type: none; 
      padding: 0; 
    }
    li { 
      margin: 15px 0; 
      padding: 20px; 
      border-radius: 8px; 
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    li:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .report-name { 
      font-size: 1.2em; 
      font-weight: bold; 
      margin-bottom: 10px; 
      color: #2c3e50;
    }
    .report-date { 
      color: #666; 
      margin-bottom: 8px; 
      font-size: 0.9em;
    }
    .report-size {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 15px;
    }
    .btn { 
      display: inline-block; 
      padding: 10px 20px; 
      border-radius: 4px; 
      text-decoration: none; 
      font-weight: bold; 
      background-color: #4CAF50; 
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: background-color 0.2s ease, transform 0.1s ease;
    }
    .btn:hover { 
      background-color: #3e8e41; 
      transform: translateY(-1px);
    }
    .btn:active {
      transform: translateY(1px);
    }
    .no-reports { 
      padding: 30px; 
      background-color: white; 
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .loading {
      text-align: center;
      padding: 30px;
      color: #666;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .error-msg { 
      padding: 20px; 
      background-color: #f8d7da; 
      border-radius: 4px; 
      color: #721c24; 
      text-align: center;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .refresh-btn {
      padding: 8px 16px;
      background-color: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.2s;
    }
    .refresh-btn:hover {
      background-color: #0b7dda;
    }
    footer {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Next.js Bundle Analysis Reports</h1>
    <button id="refreshBtn" class="refresh-btn">Refresh</button>
  </div>
  <div id="reports" class="loading">Loading reports...</div>
  <footer>
    Next.js Bundle Analysis Report Viewer
  </footer>

  <script>
    // Script to list reports
    async function loadReports() {
      try {
        const response = await fetch('/api/reports');
        const reports = await response.json();
        
        const reportsList = document.getElementById('reports');
        
        if (reports.length === 0) {
          reportsList.innerHTML = '<div class="no-reports">No reports available.<br><br>Generate a report first using:<br><code>node ci-report-generator.js</code></div>';
          return;
        }
        
        let html = '<ul>';
        reports.forEach(report => {
          const date = new Date(report.date).toLocaleString();
          
          html += \`<li>
            <div class="report-name">\${report.name}</div>
            <div class="report-date">Generated: \${date}</div>
            <div class="report-size">Size: \${formatBytes(report.size)}</div>
            <a href="/report/\${report.name}" target="_blank" class="btn">View Report</a>
          </li>\`;
        });
        html += '</ul>';
        
        reportsList.innerHTML = html;
      } catch (error) {
        console.error('Error loading reports:', error);
        document.getElementById('reports').innerHTML = '<div class="error-msg">Error loading reports. Please try again.</div>';
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
    
    // Event listener for refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
      document.getElementById('reports').innerHTML = '<div class="loading">Loading reports...</div>';
      loadReports();
    });
    
    // Load reports when page loads
    document.addEventListener('DOMContentLoaded', loadReports);
  </script>
</body>
</html>`;
}

// Start the server
server.listen(PORT, () => {
  console.log(`Next.js Bundle Report Viewer running at http://localhost:${PORT}`);
  console.log(`Open your browser to view reports`);
});