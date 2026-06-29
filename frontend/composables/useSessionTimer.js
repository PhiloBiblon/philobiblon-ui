import { onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

// How long before expiry the user is warned.
const WARNING_LEAD_MS = 5 * 60 * 1000

// Watches the authenticated session and proactively reacts to its expiry:
// warns the user shortly before the session ends and, once it expires, logs
// out and notifies — without waiting for a failed write to reveal it.
export function useSessionTimer () {
  const { $notification } = useNuxtApp()
  const { t } = useI18n()
  const authStore = useAuthStore()
  const oauthCookie = useCookie('oauth')

  let warnTimer = null
  let expiryTimer = null

  function clearTimers () {
    if (warnTimer) { clearTimeout(warnTimer); warnTimer = null }
    if (expiryTimer) { clearTimeout(expiryTimer); expiryTimer = null }
  }

  function handleExpiry () {
    clearTimers()
    if (!authStore.isLogged) return
    authStore.logout()
    oauthCookie.value = null
    $notification.error(t('auth.session.expired'))
  }

  function warn (expiresAt) {
    // Re-check the live session: a throttled timer may fire after expiry or
    // after a manual logout.
    if (!authStore.isLogged || Date.now() >= expiresAt) return
    const minutes = Math.max(1, Math.round((expiresAt - Date.now()) / 60000))
    $notification.warning(t('auth.session.expiring_soon', { minutes }))
  }

  function schedule (expiresAt) {
    clearTimers()
    if (!expiresAt) return

    const msToExpiry = expiresAt - Date.now()
    if (msToExpiry <= 0) {
      handleExpiry()
      return
    }

    const msToWarning = msToExpiry - WARNING_LEAD_MS
    if (msToWarning > 0) {
      warnTimer = setTimeout(() => warn(expiresAt), msToWarning)
    } else {
      // Session restored already inside the warning window: warn right away.
      warn(expiresAt)
    }

    expiryTimer = setTimeout(handleExpiry, msToExpiry)
  }

  watch(() => authStore.expiresAt, schedule, { immediate: true })

  onBeforeUnmount(clearTimers)
}
