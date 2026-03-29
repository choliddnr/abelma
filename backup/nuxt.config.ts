// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },

  nitro: {
    preset: 'cloudflare-pages'
  },

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt'
  ],

  vite: {
    plugins: [
      tailwindcss()
    ]
  },

  css: ['~/assets/base.css']
})
