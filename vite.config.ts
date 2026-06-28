import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build to /docs so GitHub Pages can serve from main → /docs.
// base "./" keeps asset URLs relative for a project Pages site.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
