<template>
  <create-base
    :table="table"
    :breadcrumb-items="breadcrumbItems"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()

const table = route.params.table
const breadcrumbItems = [
  { title: t('common.create'), disabled: true },
  { title: t('menu.item.search.item.' + table + '.label'), disabled: true },
  { title: t('item.label'), disabled: true }
]
</script>
