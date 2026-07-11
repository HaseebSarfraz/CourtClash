import { defineConfig } from "vite";

export default defineConfig({
  root: "static",
  server: {
    port: 5173,
  },
  build: {
    outDir: "../dist",
  },
});
