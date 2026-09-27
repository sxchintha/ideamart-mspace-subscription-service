import { defineConfig } from "vitest/config";

// Tests run against the Auth and Firestore emulators; start them with `npm test`.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    setupFiles: ["tests/setup.js"],
    fileParallelism: false,
    env: {
      SESSIONS_DB_PATH: ":memory:",
      ENABLE_WHITELIST: "false",
      DIALOG_APP_ID: "test-dialog-app",
      DIALOG_APP_PASSWORD: "test-dialog-password",
      MOBITEL_APP_ID: "test-mobitel-app",
      MOBITEL_APP_PASSWORD: "test-mobitel-password",
    },
  },
});
