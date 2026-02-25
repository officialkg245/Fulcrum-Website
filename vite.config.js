import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to IPv4/all interfaces so the site opens reliably in browsers
    // that prefer 127.0.0.1 over ::1 for "localhost".
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://localhost:5174",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
