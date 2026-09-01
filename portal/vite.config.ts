import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      buffer: "buffer/",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
  define: {
    global: "globalThis",
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/civic": { target: "https://dao.won.onl", changeOrigin: true },
      "/cache": { target: "http://127.0.0.1:8790", changeOrigin: true },
    },
  },
  preview: {
    port: 4173,
    host: true,
    proxy: {
      "/civic": { target: "https://dao.won.onl", changeOrigin: true },
      "/cache": { target: "http://127.0.0.1:8790", changeOrigin: true },
    },
  },
  base: process.env.VITE_BASE || "/",
});
