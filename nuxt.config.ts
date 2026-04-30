// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  modules: [
    "@nuxt/fonts",
    "@nuxt/image",
    "@pinia/nuxt",
    "pinia-plugin-unstorage/nuxt",
    "@nuxt/test-utils/module",
    "@nuxt/icon",
    "@vite-pwa/nuxt",
  ],
  app: {
    head: {
      title: "Abelma - Belajar Huruf & Kata",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Aplikasi belajar huruf dan kata untuk anak-anak Indonesia",
        },
        { name: "theme-color", content: "#FFF9E3" },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico" },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
      ],
    },
  },
  pwa: {
    registerType: "prompt",
    includeAssets: ["favicon.ico", "apple-touch-icon.png"],
    manifest: {
      name: "Abelma - Belajar Huruf & Kata",
      short_name: "Abelma",
      description:
        "Aplikasi belajar huruf dan kata untuk anak-anak Indonesia",
      theme_color: "#FFF9E3",
      background_color: "#FFF9E3",
      display: "standalone",
      orientation: "portrait",
      scope: "/",
      start_url: "/",
      lang: "id",
      icons: [
        {
          src: "android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"],
      globIgnores: ["img/**", "audio/**"],
      maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      navigateFallback: "/index.html",
      runtimeCaching: [
        {
          urlPattern: /\.(webm|mp3|wav|ogg)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "audio-cache",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60,
            },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /\.(webp|png|jpg|jpeg|gif)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "image-cache",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60,
            },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
  },
  // pinia: {
  //   // storesDirs: ["./stores/**"],
  // },
  piniaUnstorage: {
    namespace: "abelma:",
  },
  css: ["./app/assets/main.css"],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["canvas-confetti", "better-auth/vue", "better-auth/client/plugins"],
    },
  },
  nitro: {
    preset: "cloudflare_pages",
    // logLevel: 3, // very important
  },
  runtimeConfig: {
    betterAuth: {
      url: "",
      secret: "",
    },
    google: {
      clientId: "",
      clientSecret: "",
    },
    midtrans: {
      serverKey: "",
      isProduction: false,
    },
    public: {
      midtrans: {
        clientKey: "",
      },
    },
  },
});
