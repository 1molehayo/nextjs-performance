
// @ts-check
// Import bundle analyzer
import BundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
  analyzerMode: 'static',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default withBundleAnalyzer(nextConfig);
