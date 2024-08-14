<template>
  <privacy-policy-base
    :breadcrumb-items="breadcrumbItems"
  />
</template>

<script>
export default {
  data () {
    return {
      breadcrumbItems: [
        {
          text: this.$i18n.t('privacyPolicy.label'),
          disabled: true
        }
      ]
    }
  },
  mounted () {
    this.$store.commit('breadcrumb/setItems', this.breadcrumbItems)
  }
}
</script>
