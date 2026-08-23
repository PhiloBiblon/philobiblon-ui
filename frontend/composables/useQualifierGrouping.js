// wikibase-edit accepts either a single value or an array of values per
// qualifier property (see buildPropSnaksFactory/forceArray in wikibase-edit),
// so grouping into arrays here lets a claim carry more than one qualifier
// value for the same property instead of the last one silently winning.
export function useQualifierGrouping () {
  function groupByProperty (items, getPropertyId, getValue) {
    const grouped = {}
    for (const item of items || []) {
      const propertyId = getPropertyId(item)
      const value = getValue(item)
      if (!propertyId || value == null || value === '') {
        continue
      }
      if (!grouped[propertyId]) {
        grouped[propertyId] = []
      }
      grouped[propertyId].push(value)
    }
    return grouped
  }

  return { groupByProperty }
}
