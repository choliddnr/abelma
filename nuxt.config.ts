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
  ],
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
      include: [
        "canvas-confetti",
        "better-auth/vue",
        "better-auth/client/plugins",
      ],
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
  },
});
