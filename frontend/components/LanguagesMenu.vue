<template>
  <v-menu content-class="lang-menu">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="text"
        class="d-flex align-center pa-1"
      >
        <v-img
          :src="localeFlag"
          alt="flag"
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
          <v-img :src="item.image" alt="flag" :width="27" :height="15" class="mr-3" />
        </template>
        <v-list-item-title>{{ item.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, setLocale } = useI18n()
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
  setLocale(languages[index].locale)
}
</script>

<style scoped>
:deep(.v-image__image--cover) {
  background-size: unset !important;
}
</style>
