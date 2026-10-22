// The bibliography (BETA/BITAGAP/BITECA) last picked in a search form, kept in
// localStorage so it survives across sessions and preselects the create form (#430).
const KEY = 'philobiblon_default_bibliography'
const BIBLIOGRAPHIES = ['BETA', 'BITAGAP', 'BITECA']

export function useDefaultBibliography () {
  function load () {
    if (typeof localStorage === 'undefined') return null
    const saved = localStorage.getItem(KEY)
    return BIBLIOGRAPHIES.includes(saved) ? saved : null
  }

  function save (bibliography) {
    if (typeof localStorage === 'undefined') return
    if (BIBLIOGRAPHIES.includes(bibliography)) {
      localStorage.setItem(KEY, bibliography)
    } else {
      localStorage.removeItem(KEY)
    }
  }

  return { load, save }
}
