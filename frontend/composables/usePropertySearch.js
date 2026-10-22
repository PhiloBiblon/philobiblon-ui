export function usePropertySearch () {
  const { $wikibase } = useNuxtApp()
  const { locale } = useI18n()
  const { applyAlternativeLabels } = useAlternativeLabels()

  // Wikibase's own label search (wbsearchentities) doesn't resolve a P# directly,
  // the same gap fixed for Q#/PB ID item-value search in #557. Resolve it ourselves.
  async function resolvePropertyById (term) {
    const value = term.trim().toUpperCase()
    if (!$wikibase.getPItemPattern().test(value)) { return null }
    try {
      const entity = await $wikibase.getEntity(value, locale.value)
      if (!entity || entity.missing !== undefined) { return null }
      const label = $wikibase.getValueByLang(entity.labels, locale.value)
      return { id: value, label: label?.value ?? value, datatype: entity.datatype }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async function searchProperties (value, table) {
    if (!value || typeof value !== 'string') { return [] }

    const directMatch = await resolvePropertyById(value)
    if (directMatch) {
      if (table) { await applyAlternativeLabels(table, [directMatch]) }
      return [directMatch]
    }

    const search = await $wikibase.searchEntityByName(value, locale.value, locale.value, 'property')
    if (search && search.length) {
      if (table) { await applyAlternativeLabels(table, search) }
      return search
    }
    return []
  }

  // Debounced per-row search for the Property fields. Each row owns one timer and
  // one request id; a response is dropped if a newer keystroke happened meanwhile
  // (ids come from a single monotonic counter so a row reusing an index after
  // splice() can never match a stale response). The row is looked up by its id
  // when the response arrives, so removing a row above it doesn't drop the result.
  function createRowSearch (getTable, onResult, debounceMs = 300) {
    const timers = []
    const requestIds = []
    let nextRequestId = 0

    function search (value, index) {
      clearTimeout(timers[index])
      const requestId = (requestIds[index] = ++nextRequestId)
      if (!value || typeof value !== 'string') {
        onResult(index, [])
        return
      }
      timers[index] = setTimeout(async () => {
        const result = await searchProperties(value, getTable())
        const row = requestIds.indexOf(requestId)
        if (row === -1) { return }
        onResult(row, result)
      }, debounceMs)
    }

    function remove (index) {
      clearTimeout(timers[index])
      timers.splice(index, 1)
      requestIds.splice(index, 1)
    }

    return { search, remove }
  }

  return { searchProperties, createRowSearch }
}
