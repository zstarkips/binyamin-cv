import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  outputFileTracingIncludes: { '/api/cv': ['./public/fonts/**/*', './public/images/**/*'] },
};
export default config;
