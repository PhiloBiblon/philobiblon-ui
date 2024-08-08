<template>
  <div class="container">
    <h2 v-html="$i18n.t('menu.item.privacyPolicy.label')"/>
    <h4 v-html="$i18n.t('menu.item.privacyPolicy.consent.title')"/>
    <p v-html="$i18n.t('menu.item.privacyPolicy.consent.desc')"/>
    <h4 v-html="$i18n.t('menu.item.privacyPolicy.comments.title')"/>
    <p>
      <strong>{{ $i18n.t('menu.item.privacyPolicy.comments.subtitle') }}:</strong>
      {{ $i18n.t('menu.item.privacyPolicy.comments.subtitleDesc') }}
    </p>
    <p>{{ $i18n.t('menu.item.privacyPolicy.comments.desc') }}</p>
    <p>
      <strong>{{ $i18n.t('menu.item.privacyPolicy.userAgent.subtitle') }}:</strong>
      {{ $i18n.t('menu.item.privacyPolicy.userAgent.subtitleDesc') }}
    </p>
    <p>
      <strong>{{ $i18n.t('menu.item.privacyPolicy.retentionPeriod.subtitle') }}:</strong>
      {{ $i18n.t('menu.item.privacyPolicy.retentionPeriod.subtitleDesc') }}
    </p>
    <h4 v-html="$i18n.t('menu.item.privacyPolicy.legitimateInterest.title')"/>
    <p v-html="$i18n.t('menu.item.privacyPolicy.legitimateInterest.desc')"/>
    <h4 v-html="$i18n.t('menu.item.privacyPolicy.statistics.title')"/>
    <p v-html="$i18n.t('menu.item.privacyPolicy.statistics.desc')"/>
    <h4 v-html="$i18n.t('menu.item.privacyPolicy.embedContent.title')"/>
    <p v-html="$i18n.t('menu.item.privacyPolicy.embedContent.desc')"/>
    <h4 v-html="$i18n.t('menu.item.privacyPolicy.rights.title')"/>
    <p v-html="$i18n.t('menu.item.privacyPolicy.rights.desc')"/>
    <p v-html="$i18n.t('menu.item.privacyPolicy.rights.data')"/>
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
  },
}
</script>