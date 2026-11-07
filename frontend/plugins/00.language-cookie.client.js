import { localeCodes } from '#build/i18n-options.mjs'

// Prepares the i18n `language` cookie before i18n reads it, so the last language
// the user chose always wins (#430). With `redirectOn: 'all'` i18n prefers the
// cookie over the URL prefix on the first load of any route.
//
// 1. Stale duplicates: i18n writes the cookie on `path=/`, but browsers may hold
//    older copies on a deeper path (e.g. `/ui-fg`). Those are sent first, so the
//    language chosen in the menu never won. Copies with longer paths come first
//    in `document.cookie`, so the last value is the `path=/` one: keep it, delete
//    the copies on every path prefix of the current URL (the only ones sent here)
//    and rewrite it on `/`.
// 2. No cookie yet (first visit): seed it from the URL prefix, otherwise i18n
//    would fall back to the browser language and ignore the link's language.
const MAX_AGE = 60 * 60 * 24 * 365
const EXPIRED = 'expires=Thu, 01 Jan 1970 00:00:00 GMT'

function readValues (key) {
  return document.cookie
    .split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(`${key}=`))
    .map(c => decodeURIComponent(c.slice(key.length + 1)))
}

function writeRootCookie (key, value) {
  document.cookie = `${key}=${encodeURIComponent(value)}; max-age=${MAX_AGE}; path=/; samesite=lax`
}

function pathPrefixes (pathname) {
  const prefixes = []
  let path = ''
  for (const segment of pathname.split('/').filter(Boolean)) {
    path += `/${segment}`
    prefixes.push(path, `${path}/`)
  }
  return prefixes
}

function urlLocale (baseURL) {
  const base = baseURL.replace(/\/$/, '')
  const path = window.location.pathname.startsWith(base)
    ? window.location.pathname.slice(base.length)
    : window.location.pathname
  const segment = path.split('/')[1]
  return localeCodes.includes(segment) ? segment : null
}

export default defineNuxtPlugin({
  name: 'language-cookie',
  enforce: 'pre',
  setup () {
    const config = useRuntimeConfig()
    const key = config.public.i18n?.detectBrowserLanguage?.cookieKey || 'i18n_redirected'
    const values = readValues(key).filter(v => localeCodes.includes(v))

    if (values.length === 0) {
      const locale = urlLocale(config.app.baseURL)
      if (locale) writeRootCookie(key, locale)
      return
    }
    if (values.length === 1) return

    const keep = values[values.length - 1]
    for (const path of pathPrefixes(window.location.pathname)) {
      document.cookie = `${key}=; ${EXPIRED}; path=${path}`
      document.cookie = `${key}=; ${EXPIRED}; path=${path}; domain=${window.location.hostname}`
    }
    writeRootCookie(key, keep)
  }
})
