module.exports = {
  ci: {
    collect: {
      url: ["https://nextjs-performance-xi.vercel.app/"],
      numberOfRuns: 3,
      settings: {
        preset: "perf",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.7 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
    server: {
      // Local server configuration (if needed)
      port: 9000,
    },
  },
};
