import nextConfig from "eslint-config-next/core-web-vitals";
import tsConfig from "eslint-config-next/typescript";

// Pin the React version explicitly so eslint-plugin-react@7.37 skips its
// auto-detect codepath, which calls context.getFilename() — a method removed
// in ESLint 10. Without this, linting crashes on every file.
const config = [
  ...nextConfig,
  ...tsConfig,
  { settings: { react: { version: "19" } } },
];

export default config;
