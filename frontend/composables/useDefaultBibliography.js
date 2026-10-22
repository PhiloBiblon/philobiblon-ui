// The bibliography (BETA/BITAGAP/BITECA) last picked in a search form, kept in
// localStorage so it survives across sessions and preselects the create form (#430).
// Storage can be blocked or full: failures fall back to no saved bibliography.
const KEY = 'philobiblon_default_bibliography'
const BIBLIOGRAPHIES = ['BETA', 'BITAGAP', 'BITECA']

export function useDefaultBibliography () {
  function load () {
    try {
      const saved = localStorage.getItem(KEY)
      return BIBLIOGRAPHIES.includes(saved) ? saved : null
    } catch (e) {
      console.error('Could not read default bibliography', e)
      return null
    }
  }

  function save (bibliography) {
    try {
      if (BIBLIOGRAPHIES.includes(bibliography)) {
        localStorage.setItem(KEY, bibliography)
      } else {
        localStorage.removeItem(KEY)
      }
    } catch (e) {
      console.error('Could not save default bibliography', e)
    }
  }

  return { load, save }
}
