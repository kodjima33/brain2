// Importing env files here to validate on build
import "./src/env.js";
import withMdx from "@next/mdx";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@brain2/ai", "@brain2/db", "@brain2/lib"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.FLUENTFFMPEG_COV": false,
      }),
    );
    return config;
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

export default withMdx()(config);
