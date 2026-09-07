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
      // Own cache-server on :8790 when VITE_OWN_CACHE=1; otherwise same civic pool.
      "/cache":
        process.env.VITE_OWN_CACHE === "1"
          ? { target: "http://127.0.0.1:8790", changeOrigin: true }
          : {
              target: "https://dao.won.onl",
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/cache/, "/civic"),
            },
    },
  },
  preview: {
    port: 4173,
    host: true,
    proxy: {
      "/civic": { target: "https://dao.won.onl", changeOrigin: true },
      "/cache":
        process.env.VITE_OWN_CACHE === "1"
          ? { target: "http://127.0.0.1:8790", changeOrigin: true }
          : {
              target: "https://dao.won.onl",
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/cache/, "/civic"),
            },
    },
  },
  base: process.env.VITE_BASE || "/",
});
