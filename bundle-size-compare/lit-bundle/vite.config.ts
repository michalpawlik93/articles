import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    visualizer({
      filename: "./dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "MyComponent",
      fileName: "index",
      formats: ["es"],
    },
    sourcemap: false,
    minify: true,
    rollupOptions: {
      external: [],
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
