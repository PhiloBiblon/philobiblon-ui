<template>
  <privacy-policy-base
    :breadcrumb-items="breadcrumbItems"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const breadcrumbItems = [
  { text: t('privacyPolicy.label'), disabled: true }
]
</script>
