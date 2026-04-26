import { en as vuetifyEn, ca as vuetifyCa, es as vuetifyEs, pt as vuetifyPt } from 'vuetify/locale'

// Merge Vuetify's $vuetify translations into Vue I18n messages so that
// Vuetify components (v-date-picker, v-data-table, etc.) show translated text
// instead of keys like "$vuetify.datePicker.title".
const vuetifyByLocale = {
  en: vuetifyEn,
  ca: vuetifyCa,
  es: vuetifyEs,
  gl: vuetifyEs,
  pt: vuetifyPt
}

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n
  if (!i18n) return
  for (const [locale, messages] of Object.entries(vuetifyByLocale)) {
    i18n.mergeLocaleMessage(locale, { $vuetify: messages })
  }
})
