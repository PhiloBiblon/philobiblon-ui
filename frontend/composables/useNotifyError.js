import { useAuthStore } from '~/stores/auth'

const WIKIBASE_ERROR_KEYS = {
  maxlag: 'messages.error.wikibase_slow',
  'invalid-json': 'messages.error.wikibase_malformed_input',
  badvalue: 'messages.error.wikibase_malformed_input',
  'failed-save': 'messages.error.wikibase_save_failed',
  editconflict: 'messages.error.wikibase_edit_conflict',
  readonly: 'messages.error.wikibase_readonly',
  ratelimited: 'messages.error.wikibase_ratelimited',
  blocked: 'messages.error.wikibase_blocked',
}

export function useNotifyError () {
  const { $notification } = useNuxtApp()
  const { t } = useI18n()
  const authStore = useAuthStore()

  function notifyError (error) {
    console.error(error)

    const code = error?.body?.error?.code ?? error?.error?.code
    if (code === 'session-expired' || error?.message === 'query is undefined') {
      authStore.logout()
      $notification.error(t('messages.error.session.expired'))
      return
    }

    $notification.error(buildMessage(error, t))
  }

  return { notifyError }
}

function getFriendlyMessage (error, t) {
  const code = error?.body?.error?.code ?? error?.error?.code ?? error?.name
  if (code && WIKIBASE_ERROR_KEYS[code]) {
    return t(WIKIBASE_ERROR_KEYS[code])
  }
  if (isNetworkOrTimeout(error)) {
    return t('messages.error.wikibase_unreachable')
  }
  return error?.body?.error?.info ?? error?.error?.info ?? t('messages.error.something_went_wrong')
}

function getHint (error) {
  const code = error?.body?.error?.code ?? error?.error?.code ?? error?.name
  if (!code || code === 'Error' || WIKIBASE_ERROR_KEYS[code]) return null
  return code
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
