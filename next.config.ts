/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly tell Next.js that Turbopack is allowed.
  // This removes the error about mixing webpack config & turbopack.
  turbopack: {},

  // ❗ REMOVE ALL WEBPACK CONFIG ❗
  // Turbopack does NOT support custom webpack rules.
  // If you keep webpack() here Turbopack will fail.
};

module.exports = nextConfig;
