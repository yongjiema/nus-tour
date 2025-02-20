export function defineConfig() {
  return {
    version: "0.1.0",
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  };
}
