<template>
  <div class="container">
    <h2>{{ $i18n.t('privacyPolicy.label') }}</h2>
    <h3>{{ $i18n.t('privacyPolicy.consent.title') }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="$i18n.t('privacyPolicy.consent.desc')" />
    <h3>{{ $i18n.t('privacyPolicy.comments.title') }}</h3>
    <p>
      <strong>{{ $i18n.t('privacyPolicy.comments.subtitle') }}:</strong>
      {{ $i18n.t('privacyPolicy.comments.subtitleDesc') }}
    </p>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="$i18n.t('privacyPolicy.comments.desc')" />
    <p>
      <strong>{{ $i18n.t('privacyPolicy.userAgent.subtitle') }}:</strong>
      {{ $i18n.t('privacyPolicy.userAgent.subtitleDesc') }}
    </p>
    <p>
      <strong>{{ $i18n.t('privacyPolicy.retentionPeriod.subtitle') }}:</strong>
      {{ $i18n.t('privacyPolicy.retentionPeriod.subtitleDesc') }}
    </p>
    <h3>{{ $i18n.t('privacyPolicy.legitimateInterest.title') }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="$i18n.t('privacyPolicy.legitimateInterest.desc')" />
    <h3>{{ $i18n.t('privacyPolicy.statistics.title') }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="$i18n.t('privacyPolicy.statistics.desc')" />
    <h3>{{ $i18n.t('privacyPolicy.embedContent.title') }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="$i18n.t('privacyPolicy.embedContent.desc')" />
    <h3>{{ $i18n.t('privacyPolicy.rights.title') }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="$i18n.t('privacyPolicy.rights.desc')" />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="$i18n.t('privacyPolicy.rights.data')" />
  </div>
</template>

<script>
export default {
  props: {
    breadcrumbItems: {
      type: Array,
      default: null
    }
  },
  mounted () {
    this.$store.commit('breadcrumb/setItems', this.breadcrumbItems)
  }
}
</script>
