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
  };
  
  export default nextConfig;