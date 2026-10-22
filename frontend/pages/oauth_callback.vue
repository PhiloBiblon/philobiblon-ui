<template>
  <div />
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const { $notification, $wikibase } = useNuxtApp()
const { t, locales } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()
const authStore = useAuthStore()
const previousPathCookie = useCookie('previous-path')

// The OAuth callback URL has no locale prefix, so i18n resolves this page in the
// default locale and overwrites the language cookie. The previous path keeps the
// user's locale as its first segment: navigate with it to restore it (#430).
function previousLocale (path) {
  const segment = path.split('/')[1]
  return locales.value.some(l => l.code === segment) ? segment : null
}

// An already prefixed path is pushed as is: localePath would prefix it again
// with the (wrong) current locale.
function resolvePath (path, locale) {
  return locale ? path : localePath(path)
}

onMounted(async () => {
  const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = route.query
  const response = await $wikibase.$oauth.step3(oauthToken, oauthVerifier)
  const previousPath = previousPathCookie.value || '/'
  const locale = previousLocale(previousPath)
  if (response.status === 0) {
    const isItemView = previousPath.includes('/item/') && !previousPath.endsWith('/create')
    const home = locale ? localePath('/', locale) : localePath('/')
    await router.push(isItemView ? home : resolvePath(previousPath, locale))
    $notification.success(t('auth.login.success', { name: authStore.username }))
  } else {
    console.error('OAuth login failed:', response.error)
    await router.push(resolvePath(previousPath, locale))
    $notification.error(t('messages.error.auth.login_failed'))
  }
})
</script>
