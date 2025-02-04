/** @type {import('next').NextConfig} */

console.log('NEXT_PUBLIC_BASEPATH');
console.log(process.env.NEXT_PUBLIC_BASEPATH);
console.log('NEXT_PUBLIC_ASSET_PREFIX');
console.log(process.env.NEXT_PUBLIC_ASSET_PREFIX);

const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASEPATH,
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  cacheMaxMemorySize: 0,
};

module.exports = nextConfig;
