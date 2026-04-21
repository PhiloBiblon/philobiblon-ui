<template>
  <div />
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const { $notification, $wikibase } = useNuxtApp()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const authStore = useAuthStore()
const previousPathCookie = useCookie('previous-path')

onMounted(async () => {
  const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = route.query
  const response = await $wikibase.$oauth.step3(oauthToken, oauthVerifier)
  if (response.status === 0) {
    $notification.success(t('auth.login.success', { name: authStore.username }))
  } else {
    $notification.error(response.error)
  }
  router.push(localePath(previousPathCookie.value || '/'))
})
</script>
