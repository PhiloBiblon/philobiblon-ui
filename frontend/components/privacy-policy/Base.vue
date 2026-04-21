<template>
  <div class="container">
    <h2>{{ t('privacyPolicy.label') }}</h2>
    <h3>{{ t('privacyPolicy.consent.title') }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="t('privacyPolicy.consent.desc')" />
    <h3>{{ t('privacyPolicy.comments.title') }}</h3>
    <p>
      <strong>{{ t('privacyPolicy.comments.subtitle') }}:</strong>
      {{ t('privacyPolicy.comments.subtitleDesc') }}
    </p>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="t('privacyPolicy.comments.desc')" />
    <p>
      <strong>{{ t('privacyPolicy.userAgent.subtitle') }}:</strong>
      {{ t('privacyPolicy.userAgent.subtitleDesc') }}
    </p>
    <p>
      <strong>{{ t('privacyPolicy.retentionPeriod.subtitle') }}:</strong>
      {{ t('privacyPolicy.retentionPeriod.subtitleDesc') }}
    </p>
    <h3>{{ t('privacyPolicy.legitimateInterest.title') }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="t('privacyPolicy.legitimateInterest.desc')" />
    <h3>{{ t('privacyPolicy.statistics.title') }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="t('privacyPolicy.statistics.desc')" />
    <h3>{{ t('privacyPolicy.embedContent.title') }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="t('privacyPolicy.embedContent.desc')" />
    <h3>{{ t('privacyPolicy.rights.title') }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="t('privacyPolicy.rights.desc')" />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="t('privacyPolicy.rights.data')" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBreadcrumbStore } from '~/stores/breadcrumb'

const props = defineProps({
  breadcrumbItems: { type: Array, default: null }
})

const { t } = useI18n()
const breadcrumbStore = useBreadcrumbStore()

onMounted(() => {
  breadcrumbStore.setItems(props.breadcrumbItems)
})
</script>
