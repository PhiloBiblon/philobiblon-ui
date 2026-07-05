<template>
  <search-base
    table="subid"
    :form-definition="form"
    :breadcrumb-items="breadcrumb_items"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import createForm from '~/service/search-forms/subid'

const { t } = useI18n()

const breadcrumb_items = [
  { title: t('menu.item.search.label'), disabled: true },
  { title: t('menu.item.search.item.subid.label'), disabled: true }
]

const form = createForm()
</script>
