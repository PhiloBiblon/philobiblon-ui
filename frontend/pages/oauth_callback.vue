<template>
  <div />
</template>

<script>
export default {
  async mounted () {
    const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = this.$route.query
    const response = await this.$wikibase.$oauth.step3(oauthToken, oauthVerifier)
    if (response.status === 0) {
      this.$notification.success(this.$i18n.t('auth.login.success', { name: this.$store.state.auth.username }))
    } else {
      this.$notification.error(response.error)
    }
    this.$router.push(this.localePath('/'))
  }
}
</script>
