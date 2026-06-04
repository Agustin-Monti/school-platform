/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aoyjzknpjihwagedbqjz.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  transpilePackages: ['@school/ui'],
}

module.exports = nextConfig