// main.js - Client-side JavaScript
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
          `<span class="format-badge ${format}">${format}</span>`
        ).join('');
        
        li.innerHTML = `
          <strong>${report.name}</strong>
          <div>Date: ${date}</div>
          <div>Size: ${formatBytes(report.size)}</div>
          <div class="formats">${formatBadges}</div>
        `;
        
        li.addEventListener('click', () => loadReport(report.name));
        reportList.appendChild(li);
        
        // Add reports to the dropdown
        const option = document.createElement('option');
        option.value = report.name;
        option.textContent = `${report.name} (${date})`;
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
        reportViewer.innerHTML = `
          <div class="html-report-available">
            <p>An HTML report is available for this analysis.</p>
            <a href="/html-report/${name}" target="_blank" class="view-html-btn">
              View HTML Report
            </a>
          </div>
          <div id="interactive-viewer"></div>
        `;
      }
      
      // Fetch the JSON report data
      try {
        const response = await fetch(`/api/reports/${name}`);
        const data = await response.json();
        
        // Check if data contains a note about extraction failure
        if (data.note && data.note.includes("Data extraction failed")) {
          reportViewer.innerHTML = `
            <div class="extraction-failed">
              <p>Could not extract data for interactive visualization.</p>
              <p>Please use the HTML report instead:</p>
              <a href="/html-report/${name}" target="_blank" class="view-html-btn">
                View HTML Report
              </a>
            </div>
          `;
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
          reportViewer.innerHTML = `
            <div class="extraction-failed">
              <p>Could not load interactive visualization: ${error.message}</p>
              <p>Please use the HTML report instead:</p>
              <a href="/html-report/${name}" target="_blank" class="view-html-btn">
                View HTML Report
              </a>
            </div>
          `;
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
});