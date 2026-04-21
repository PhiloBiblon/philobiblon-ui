// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  app: {
    baseURL: process.env.BASE_URL || '/',
    head: {
      titleTemplate: '%s - philobiblon-viewer',
      title: 'philobiblon-viewer',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      version: '0.9.15',
      debug: process.env.DEBUG === 'true',
      apiBaseUrl: process.env.API_BASE_URL || '/',
      wikibaseBaseUrl: process.env.WIKIBASE_BASE_URL,
      sparqlBaseUrl: process.env.SPARQL_BASE_URL,
      wikibaseApiUrl: process.env.WIKIBASE_API_URL,
      sparqlEndpoint: process.env.SPARQL_ENDPOINT,
      sparqlQueryPrefix: process.env.SPARQL_QUERY_PREFIX
    }
  },

  css: [
    '@mdi/font/css/materialdesignicons.css',
    '@/assets/css/main.css'
  ],

  components: true,

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    'vuetify-nuxt-module',
    '@nuxt/eslint'
  ],

  vuetify: {
    moduleOptions: {
      styles: { configFile: 'assets/variables.scss' }
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light',
        themes: {
          light: {
            colors: {
              primary: '#b71c1c',
              secondary: '#e57373',
              accent: '#ff8a80',
              info: '#26a69a',
              warning: '#ffc107',
              error: '#dd2c00',
              success: '#69f0ae'
            }
          }
        }
      },
      icons: {
        defaultSet: 'mdi'
      }
    }
  },

  i18n: {
    vueI18n: './i18n.config.ts',
    locales: [
      { code: 'en', file: 'en.js' },
      { code: 'ca', file: 'ca.js' },
      { code: 'es', file: 'es.js' },
      { code: 'gl', file: 'gl.js' },
      { code: 'pt', file: 'pt.js' }
    ],
    langDir: 'lang',
    strategy: 'prefix',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'language',
      alwaysRedirect: true
    }
  },

  build: {
    transpile: ['quill']
  },

  compatibilityDate: '2026-04-20'
})
