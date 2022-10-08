import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: /^~/, replacement: path.join(__dirname, "/node_modules/") }],
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    VitePWA({
      injectRegister: "inline",
      manifest: {
        name: "Grid Unlock",
        short_name: "Grid Unlock",
        background_color: "#111418",
        description: "Distributed Crosswords",
        theme_color: "#111418",
        icons: [
          { src: "icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
          { src: "icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
          { src: "icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
          { src: "icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
          { src: "icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-120x120.png", sizes: "120x120", type: "image/png" },
          { src: "icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: "/api/xword/**",
            handler: "StaleWhileRevalidate",
          },
        ],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff2}"],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://gridunlock-org.pages.dev",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
