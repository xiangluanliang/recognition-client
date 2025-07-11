import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"

const base = process.env.VITE_BASE || "/"

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
         target: "http://127.0.0.1:8000", //本地后端
        // target: "http://8.152.101.217/api/test/", //测试后端
        // target: "http://8.152.101.217/api/master/", //正式后端
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
