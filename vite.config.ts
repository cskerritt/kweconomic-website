import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // NOTE: lucide-react is intentionally NOT in manualChunks so Vite
        // tree-shakes it per-icon. Forcing the whole library into one
        // vendor-icons chunk pulled in 600+ KB of unused icon SVGs.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) {
              return "vendor-react";
            }
          }
          // NOTE: city data is intentionally NOT grouped here - each state file
          // is dynamically imported (src/data/cities/index.ts via import.meta.glob)
          // so Vite emits a per-state chunk and a geo page loads only the one
          // state it renders, instead of all 56 (~177KB) in a single chunk.
          if (id.includes("/src/data/states")) {
            return "data-states";
          }
        },
      },
    },
  },
});
