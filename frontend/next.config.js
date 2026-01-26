/** @type {import('next').NextConfig} */

console.log('NEXT_PUBLIC_ADMIN_ROLE');
console.log(process.env.NEXT_PUBLIC_ADMIN_ROLE);
console.log('NEXT_PUBLIC_ASSET_PREFIX');
console.log(process.env.NEXT_PUBLIC_ASSET_PREFIX);
console.log('NEXT_PUBLIC_BACKEND_URL');
console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
console.log('NEXT_PUBLIC_BASEPATH');
console.log(process.env.NEXT_PUBLIC_BASEPATH);
console.log('NEXT_PUBLIC_COOKIEBOT_ID');
console.log(process.env.NEXT_PUBLIC_COOKIEBOT_ID);
console.log('NEXT_PUBLIC_FRONTEND_URL');
console.log(process.env.NEXT_PUBLIC_FRONTEND_URL);
console.log('NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL');
console.log(process.env.NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL);
console.log('NEXT_PUBLIC_MAIL_TO');
console.log(process.env.NEXT_PUBLIC_MAIL_TO);
console.log('NEXT_PUBLIC_MAPBOX_TOKEN');
console.log(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
console.log('NEXT_PUBLIC_NGSI_SERVICE_URL');
console.log(process.env.NEXT_PUBLIC_NGSI_SERVICE_URL);
console.log('NEXT_PUBLIC_OIDC_AUTHORITY');
console.log(process.env.NEXT_PUBLIC_OIDC_AUTHORITY);
console.log('NEXT_PUBLIC_OIDC_CLIENT_ID');
console.log(process.env.NEXT_PUBLIC_OIDC_CLIENT_ID);
console.log('NEXT_PUBLIC_OIDC_REDIRECT_URI');
console.log(process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI);
console.log('NEXT_PUBLIC_ORCHIDEO_CONNECT_SERVICE_URL');
console.log(process.env.NEXT_PUBLIC_ORCHIDEO_CONNECT_SERVICE_URL);
console.log('NEXT_PUBLIC_SUPER_ADMIN_ROLE');
console.log(process.env.NEXT_PUBLIC_SUPER_ADMIN_ROLE);
console.log('NEXT_PUBLIC_USI_PLATFORM_SERVICE_URL');
console.log(process.env.NEXT_PUBLIC_USI_PLATFORM_SERVICE_URL);

const nextConfig = {
  env: {
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
    NEXT_PUBLIC_BASEPATH: process.env.NEXT_PUBLIC_BASEPATH,
    NEXT_PUBLIC_ASSET_PREFIX: process.env.NEXT_PUBLIC_ASSET_PREFIX,
    NEXT_PUBLIC_ADMIN_ROLE: process.env.NEXT_PUBLIC_ADMIN_ROLE,
    NEXT_PUBLIC_SUPER_ADMIN_ROLE: process.env.NEXT_PUBLIC_SUPER_ADMIN_ROLE,
    NEXT_PUBLIC_OIDC_AUTHORITY: process.env.NEXT_PUBLIC_OIDC_AUTHORITY,
    NEXT_PUBLIC_OIDC_CLIENT_ID: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
    NEXT_PUBLIC_OIDC_REDIRECT_URI: process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI,
    NEXT_PUBLIC_MAIL_TO: process.env.NEXT_PUBLIC_MAIL_TO,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_COOKIEBOT_ID: process.env.NEXT_PUBLIC_COOKIEBOT_ID,
    NEXT_PUBLIC_GEOCODER_PROVIDER: process.env.NEXT_PUBLIC_GEOCODER_PROVIDER,
  },
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
