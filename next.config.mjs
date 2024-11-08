/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'i.imgur.com',
        },
        {
          protocol: 'https',
          hostname: 'imgur.com',
        },
        {
          protocol: 'https',
          hostname: 'cdn.discordapp.com',
        },
        {
          protocol: 'https',
          hostname: 'media.discordapp.net',
        },
        {
          protocol: 'https',
          hostname: 'raw.githubusercontent.com',
        },
        {
          protocol: 'https',
          hostname: 'github.com',
        },
        {
          protocol: 'https',
          hostname: '*.githubusercontent.com',
        },
      ],
    },
    env: {
      UMAMI_SRC: process.env.UMAMI_SRC,
      UMAMI_ID: process.env.UMAMI_ID,
    },
    async headers() {
      return [
        {
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_SITE_URL || "" },
            { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
            { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date" },
          ]
        }
      ]
    },
  };
  
  export default nextConfig;