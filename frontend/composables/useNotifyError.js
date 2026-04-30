import { useAuthStore } from '~/stores/auth'

export function useNotifyError () {
  const { $notification } = useNuxtApp()
  const { t } = useI18n()
  const authStore = useAuthStore()

  function notifyError (error) {
    console.error(error)

    if (error?.body?.error?.code === 'session-expired' || error?.message === 'query is undefined') {
      authStore.logout()
      $notification.error(t('messages.error.session.expired'))
      return
    }

    $notification.error(buildMessage(error, t))
  }

  return { notifyError }
}

function getFriendlyMessage (error, t) {
  if (error?.name === 'maxlag' || error?.body?.error?.code === 'maxlag') {
    return t('messages.error.wikibase_slow')
  }
  if (isNetworkOrTimeout(error)) {
    return t('messages.error.wikibase_unreachable')
  }
  if (error?.message?.includes('modification-failed') || error?.body?.error?.code?.includes?.('modification-failed')) {
    return t('messages.error.modification.failed')
  }
  return error?.body?.error?.info ?? t('messages.error.something_went_wrong')
}

function getHint (error) {
  const hint = error?.body?.error?.code ?? error?.name
  return (hint && hint !== 'Error') ? hint : null
}

function buildMessage (error, t) {
  const friendly = getFriendlyMessage(error, t)
  const hint = getHint(error)
  return hint ? `${friendly}\n(${hint})` : friendly
}

function isNetworkOrTimeout (error) {
  return ['TimeoutError', 'AbortError', 'request-timeout', 'wrong response format'].includes(error?.name)
    || ['ECONNREFUSED', 'UND_ERR_CONNECT_TIMEOUT'].includes(error?.code ?? error?.cause?.code)
}
