import { defineConfig } from "vite";
import string from "vite-plugin-string";

export default defineConfig({
  root: "public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    manifest: true,
  },
  server: {
    port: 8090,
    open: true,
  },
  plugins: [
    string({
      include: "**/*.hbs",
    })
  ],
});