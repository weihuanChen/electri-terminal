import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;
const useLocalConvex = process.env.E2E_CONVEX_LOCAL === "1";

const nextServer = {
  command: useLocalConvex
    ? `CONVEX_SERVER_URL=http://127.0.0.1:3210 NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210 NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211 ./node_modules/.bin/next start -p ${port}`
    : `./node_modules/.bin/next start -p ${port}`,
  url: baseURL,
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: useLocalConvex ? "./tests/e2e/global-setup.ts" : undefined,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: useLocalConvex
    ? [
        {
          command:
            "node scripts/run-convex-e2e.mjs",
          url: "http://127.0.0.1:3210/version",
          reuseExistingServer: false,
          timeout: 120_000,
        },
        nextServer,
      ]
    : nextServer,
});
