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

  return { searchProperties }
}
