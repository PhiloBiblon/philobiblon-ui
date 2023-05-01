<template>
  <div />
</template>

<script>
export default {
  async mounted () {
    const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = this.$route.query
    await this.$wikibase.$oauth.step3(oauthToken, oauthVerifier)
    this.$notification.success(this.$i18n.t('auth.login.success', { name: this.$store.state.auth.username }))
    this.$router.push(this.localePath('/'))
  }
}
</script>
