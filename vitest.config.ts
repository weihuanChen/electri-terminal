import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "tests/**/*.test.ts"],
    exclude: [".trunk/**", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      include: [
        "lib/i18n/config.ts",
        "lib/i18n/localizedRoutes.ts",
        "lib/i18n/localizationModel.ts",
        "lib/i18n/urlResolver.ts",
        "lib/i18n/seoOutput.ts",
        "lib/i18n/gscLinkIntegrityGate.ts",
        "lib/i18n/localizedContentOverlay.ts",
        "lib/i18n/navigationSafety.ts",
        "lib/i18n/internalLinkSafety.ts",
        "lib/i18n/readiness.ts",
        "lib/i18n/staticPageContent.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 85,
      },
    },
  },
});
