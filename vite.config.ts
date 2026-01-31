import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/clear': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/signals': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/events': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/reciveSms': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      }
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
