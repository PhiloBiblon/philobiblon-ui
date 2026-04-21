<template>
  <v-menu>
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="text"
        class="d-flex align-center pa-0"
        height="0"
        min-width="0"
      >
        <v-img
          :src="localeFlag"
          alt="flag"
          contain
          max-width="24"
          max-height="16"
        />
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, index) in languages"
        :key="index"
        density="compact"
        @click="changeLocale(index)"
      >
        <template #prepend>
          <v-avatar>
            <v-img :src="item.image" alt="flag" />
          </v-avatar>
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

const languages = [
  { locale: 'ca', name: 'Català', image: 'img/flags/flag_catalonia.gif' },
  { locale: 'es', name: 'Español', image: 'img/flags/flag_spain.gif' },
  { locale: 'en', name: 'English', image: 'img/flags/flag_unitedstates.gif' },
  { locale: 'gl', name: 'Galego', image: 'img/flags/flag_galicia.gif' },
  { locale: 'pt', name: 'Português', image: 'img/flags/flag_portugal.gif' }
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
