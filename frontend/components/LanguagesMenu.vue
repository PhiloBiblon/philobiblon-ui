<template>
  <v-menu content-class="lang-menu">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="text"
        class="d-flex align-center pa-1"
        :aria-label="t('common.language_selector')"
      >
        <v-img
          :src="localeFlag"
          alt=""
          aria-hidden="true"
          :width="27"
          :height="15"
        />
      </v-btn>
    </template>
    <v-list theme="light">
      <v-list-item
        v-for="(item, index) in languages"
        :key="index"
        density="compact"
        @click="changeLocale(index)"
      >
        <template #prepend>
          <v-img :src="item.image" alt="" aria-hidden="true" :width="27" :height="15" class="mr-3" />
        </template>
        <v-list-item-title>{{ item.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue'

const { locale, setLocale, t } = useI18n()
const config = useRuntimeConfig()
const baseURL = config.app.baseURL.replace(/\/$/, '')

const languages = [
  { locale: 'ca', name: 'Català', image: `${baseURL}/img/flags/flag_catalonia.gif` },
  { locale: 'es', name: 'Español', image: `${baseURL}/img/flags/flag_spain.gif` },
  { locale: 'en', name: 'English', image: `${baseURL}/img/flags/flag_unitedstates.gif` },
  { locale: 'gl', name: 'Galego', image: `${baseURL}/img/flags/flag_galicia.gif` },
  { locale: 'pt', name: 'Português', image: `${baseURL}/img/flags/flag_portugal.gif` }
]

const localeFlag = computed(() => languages.find(lang => lang.locale === locale.value)?.image ?? '')

function changeLocale (index) {
  if (!Number.isFinite(index) || !Number.isInteger(index) || index < 0 || index >= languages.length) {
    return
  }
  setLocale(languages[index].locale)
}
</script>

<style scoped>
:deep(.v-image__image--cover) {
  background-size: unset !important;
}
</style>
