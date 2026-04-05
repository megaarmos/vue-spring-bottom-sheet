// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],

  devtools: {
    enabled: true,
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },

  css: ['@douxcode/vue-spring-bottom-sheet/dist/style.css', '~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true },
  },

  nitro: {
    preset: 'static',
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
      },
    },
  },
})
