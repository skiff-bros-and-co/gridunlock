import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import analyze from "rollup-plugin-analyzer";

const NODE_MODULES_PATH = path.join(__dirname, "/node_modules/");
const depPath = (module: string) => path.join(NODE_MODULES_PATH, module);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: /^~/, replacement: NODE_MODULES_PATH }],
  },
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://gridunlock-org.pages.dev",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.startsWith(NODE_MODULES_PATH)) {
            return;
          }

          if (id.startsWith(depPath("y-")) || id.startsWith(depPath("simple-peer/"))) {
            return "yjs";
          }

          if (id.startsWith(depPath("react/")) || id.startsWith(depPath("react-dom/"))) {
            return "react";
          }

          if (id.startsWith(depPath("@blueprintjs/"))) {
            return "blueprint";
          }

          return "vendor";
        },
      },
      plugins: [
        analyze({
          limit: 10,
        }),
      ],
    },
  },
});
