import { defineConfig } from "vite";

export default defineConfig({
  root: "static",
  server: {
    port: 3000,
  },
  build: {
    outDir: "../dist",
  },
});
