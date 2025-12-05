import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
