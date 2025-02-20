import content from "@originjs/vite-plugin-content";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    static: true,
    compressPublicAssets: true,
    prerender: {
      crawlLinks: true,
    },
  },
  vite: {
    plugins: [content()],
  },
  build: {
    analyze: true,
  },
  app: {
    head: {
      viewport: "width=device-width,initial-scale=1",
      link: [{ rel: "icon", href: "/logo.webp", sizes: "any" }],
    },
  },
  webpack: {
    optimization: {
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        minChunks: 2,
        automaticNameDelimiter: "-",
        maxSize: 51200,
        maxAsyncRequests: 6,
        maxInitialRequests: 6,
      },
    },
  },
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["nuxtjs-naive-ui"],
});
