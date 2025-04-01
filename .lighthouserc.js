// use this config to compare current vs previous scores
module.exports = {
  ci: {
    collect: {
      url: ["https://nextjs-performance-xi.vercel.app/"],
      numberOfRuns: 3,
      settings: {
        preset: "perf",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      },
    },
    assert: {
      assertions: {
        // Fail if performance score drops by more than 5 points
        "categories:performance": ["error", { minScore: 0.7, aggregationMethod: "median-run", compareWithBaseline: true, maxDelta: -0.05 }],
        // Warn if accessibility drops by more than 5 points
        "categories:accessibility": ["warn", { minScore: 0.8, aggregationMethod: "median-run", compareWithBaseline: true, maxDelta: -0.05 }],
        // Warn if best-practices drops by more than 5 points
        "categories:best-practices": ["warn", { minScore: 0.9, aggregationMethod: "median-run", compareWithBaseline: true, maxDelta: -0.05 }],
        // Warn if SEO drops by more than 5 points
        "categories:seo": ["warn", { minScore: 0.9, aggregationMethod: "median-run", compareWithBaseline: true, maxDelta: -0.05 }],
        
        // Key metrics with delta checks
        "first-contentful-paint": ["warn", { maxNumericValue: 2000, aggregationMethod: "median-run", compareWithBaseline: true, maxDelta: 500 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500, aggregationMethod: "median-run", compareWithBaseline: true, maxDelta: 500 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1, aggregationMethod: "median-run", compareWithBaseline: true, maxDelta: 0.05 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300, aggregationMethod: "median-run", compareWithBaseline: true, maxDelta: 100 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
    bulldozer: {
      // Only keep data from main branch as baseline
      dailyBranches: ['main', 'master'],
      // Keep last 10 baseline runs
      dailyLimit: 10,
    },
  },
};
