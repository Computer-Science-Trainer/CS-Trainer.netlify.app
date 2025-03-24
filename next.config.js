/** @type {import('next').NextConfig} */
const nextConfig = {};

const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();
 
module.exports = withNextIntl(nextConfig);