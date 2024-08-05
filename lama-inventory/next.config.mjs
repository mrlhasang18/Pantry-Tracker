/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    REACT_APP_FREEPIK_API_KEY: process.env.REACT_APP_FREEPIK_API_KEY,
    REACT_APP_RECIPE_API_KEY: process.env.REACT_APP_RECIPE_API_KEY,
  },
};

export default nextConfig;