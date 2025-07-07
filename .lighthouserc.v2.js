// use this config to measure fixed thresholds for Performance Metrics 
module.exports = {
    ci: {
      collect: {
        url: ["https://nextjs-performance-xi.vercel.app/"],
        numberOfRuns: 3,
        settings: {
          preset: "desktop",
          onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        },
      },
      assert: {
        // Use environment variables for thresholds if available, otherwise use defaults
        assertions: {
          // Main category scores
          "categories:performance": ["error", { minScore: process.env.PERF_THRESHOLD ? parseFloat(process.env.PERF_THRESHOLD) / 100 : 0.6 }],
          "categories:accessibility": ["error", { minScore: process.env.A11Y_THRESHOLD ? parseFloat(process.env.A11Y_THRESHOLD) / 100 : 0.8 }],
          "categories:best-practices": ["error", { minScore: process.env.BP_THRESHOLD ? parseFloat(process.env.BP_THRESHOLD) / 100 : 0.9 }],
          "categories:seo": ["error", { minScore: process.env.SEO_THRESHOLD ? parseFloat(process.env.SEO_THRESHOLD) / 100 : 0.9 }],
          
          // Key metrics with fixed thresholds
          "first-contentful-paint": ["warn", { maxNumericValue: process.env.FCP_THRESHOLD || 2000 }],
          "largest-contentful-paint": ["warn", { maxNumericValue: process.env.LCP_THRESHOLD || 2500 }],
          "cumulative-layout-shift": ["warn", { maxNumericValue: process.env.CLS_THRESHOLD || 0.1 }],
          "total-blocking-time": ["warn", { maxNumericValue: process.env.TBT_THRESHOLD || 300 }],
          "interactive": ["warn", { maxNumericValue: process.env.TTI_THRESHOLD || 3500 }],
        },
      },
      upload: {
        target: "temporary-public-storage",
      },
      preset: 'lighthouse:no-pwa',
    },
  };