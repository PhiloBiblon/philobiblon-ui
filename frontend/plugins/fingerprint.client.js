import { load } from '@fingerprintjs/fingerprintjs'

export default async function ({ app }, inject) {
  const fp = await load()
  const result = await fp.get()

  function generateUUID () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  const fingerprintData = {
    fingerprint: result.visitorId,
    userAgent: navigator.userAgent,
    platform: navigator.platform,

    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    localToken: localStorage.getItem('approval_token') || generateUUID()
  }

  if (!localStorage.getItem('approval_token')) {
    localStorage.setItem('approval_token', fingerprintData.localToken)
  }

  inject('fingerprint', fingerprintData)
}
