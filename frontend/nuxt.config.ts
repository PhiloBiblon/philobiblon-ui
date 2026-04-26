// https://nuxt.com/docs/api/configuration/nuxt-config
import { en as vuetifyEn, ca as vuetifyCa, es as vuetifyEs, pt as vuetifyPt } from 'vuetify/locale'

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
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap' }
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
      defaults: {
        VTextField: { variant: 'underlined', color: 'primary' },
        VAutocomplete: { variant: 'underlined', color: 'primary' },
        VSelect: { variant: 'underlined', color: 'primary' },
        VCombobox: { variant: 'underlined', color: 'primary' },
        VTextarea: { variant: 'underlined', color: 'primary' },
        VRadio: { color: 'primary' },
        VRadioGroup: { color: 'primary' },
        VSwitch: { color: 'primary' },
        VCheckbox: { color: 'primary' },
        VDatePicker: { color: 'primary' }
      },
      locale: {
        locale: 'en',
        fallback: 'en',
        messages: {
          en: vuetifyEn,
          ca: vuetifyCa,
          es: vuetifyEs,
          gl: vuetifyEs,
          pt: vuetifyPt
        }
      },
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
          },
          dark: {
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
    restructureDir: false,
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
    },
    compilation: {
      strictMessage: false,
      jit: true
    }
  },

  vite: {
    optimizeDeps: {
      include: ['quill/dist/quill.js']
    }
  },

  compatibilityDate: '2026-04-20'
})
