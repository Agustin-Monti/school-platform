/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@school/ui', '@school/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aoyjzknpjihwagedbqjz.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig