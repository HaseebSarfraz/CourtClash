import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "static",
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: "../dist",
  },
});
