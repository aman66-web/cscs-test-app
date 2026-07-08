/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { nextRuntime, webpack }) => {
    // ---------------------------------------------------------------
    // Edge Runtime fix for @supabase/ssr in middleware.
    //
    // @supabase/supabase-js reads `process.version` at module load (to build
    // its X-Client-Info header). It ships no edge/worker export condition, so
    // on Vercel's Edge Runtime the Node build loads and the edge bundler
    // rejects the middleware with "referencing unsupported modules".
    //
    // The reference is guarded (`typeof process !== "undefined"`) and never
    // actually runs on edge — so for the EDGE build only we replace the token
    // with an empty string literal, which removes the Node-API reference the
    // analyzer flags. The Node.js server build and the client build are left
    // untouched (process.version stays real there).
    // ---------------------------------------------------------------
    if (nextRuntime === "edge") {
      config.plugins.push(
        new webpack.DefinePlugin({ "process.version": JSON.stringify("") })
      );
    }
    return config;
  },
};

export default nextConfig;
