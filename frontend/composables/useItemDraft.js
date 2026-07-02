// Persists an in-progress "create item" form to sessionStorage so the user's
// work survives a session expiry + OAuth re-login round-trip (issue #468).
// sessionStorage is per-tab and survives the cross-origin OAuth navigation,
// but is cleared when the tab closes — appropriate for a transient draft.
const PREFIX = 'pb-draft-'

export function useItemDraft (table) {
  const key = PREFIX + table

  function save (data) {
    if (!import.meta.client) return
    try {
      sessionStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.error('Could not save draft', e)
    }
  }

  function load () {
    if (!import.meta.client) return null
    try {
      const raw = sessionStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      console.error('Could not read draft', e)
      return null
    }
  }

  function clear () {
    if (!import.meta.client) return
    sessionStorage.removeItem(key)
  }

  return { save, load, clear }
}
