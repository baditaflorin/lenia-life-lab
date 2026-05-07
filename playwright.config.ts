import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: "http://127.0.0.1:4187/lenia-life-lab/",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run pages:serve",
    url: "http://127.0.0.1:4187/lenia-life-lab/",
    reuseExistingServer: false,
    timeout: 60_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
