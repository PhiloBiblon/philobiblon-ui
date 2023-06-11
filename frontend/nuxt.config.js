import colors from 'vuetify/es5/util/colors'

export default {
  server: {
    host: '0'
  },

  env: {
    debug: process.env.DEBUG==='true'
  },

  publicRuntimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL || '/.',
    wikibaseBaseUrl: process.env.WIKIBASE_BASE_URL,
    sparqlBaseUrl: process.env.SPARQL_BASE_URL,
    wikibaseApiUrl: process.env.WIKIBASE_API_URL,
    sparqlEndpoint: process.env.SPARQL_ENDPOINT,
    sparqlQueryPrefix: process.env.SPARQL_QUERY_PREFIX
  },

  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
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
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/css/main.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/config.js',
    '~/plugins/wikibase.js',
    '~/plugins/notification.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    // https://github.com/anteriovieira/nuxt-material-design-icons
    'nuxt-material-design-icons',
    // https://github.com/shakee93/vue-toasted
    '@nuxtjs/toast'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/i18n'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en.js'
      },
      {
        code: 'ca',
        file: 'ca.js'
      },
      {
        code: 'es',
        file: 'es.js'
      },
      {
        code: 'ga',
        file: 'ga.js'
      },
      {
        code: 'po',
        file: 'po.js'
      }
    ],
    langDir: 'lang/',
    defaultLocale: 'en'
  },

  toast: {
    position: 'top-center',
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      themes: {
        light: {
          primary: colors.red.darken4,
          accent: colors.red.accent1,
          secondary: colors.red.lighten2,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
