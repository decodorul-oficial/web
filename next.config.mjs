/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'cytoscape', 'simple-datatables']
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          lucide: {
            name: 'lucide',
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            chunks: 'all',
            priority: 10
          },
          cytoscape: {
            name: 'cytoscape',
            test: /[\\/]node_modules[\\/]cytoscape[\\/]/,
            chunks: 'all',
            priority: 10
          },
          dataTables: {
            name: 'data-tables',
            test: /[\\/]node_modules[\\/]simple-datatables[\\/]/,
            chunks: 'all',
            priority: 10
          }
        }
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
