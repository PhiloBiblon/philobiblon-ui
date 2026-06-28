export function useAlternativeLabels () {
  const { $wikibase } = useNuxtApp()
  const { locale } = useI18n()

  async function applyAlternativeLabels (table, searchResults) {
    const ids = searchResults.map(r => r.id)
    try {
      const entities = await $wikibase.getEntities(ids, locale.value)
      for (const result of searchResults) {
        const entity = entities[result.id]
        if (entity) {
          const alt = $wikibase.getAlternativeLabel(table, entity, locale.value)
          if (alt?.value) {
            result.label = alt.value
          }
        }
      }
    } catch {}
  }

  return { applyAlternativeLabels }
}
