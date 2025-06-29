import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, "**/coverage/**"],
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      enabled: true,
      exclude: [...(configDefaults.coverage.exclude ?? []), "**/coverage/**"],
    },
  },
});
