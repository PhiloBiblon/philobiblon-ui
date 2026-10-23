// Text shown by a search dropdown with no options. An empty field invites the
// user to type instead of claiming there is no data: options only come once a
// search runs, so "no data" is reserved for a search that found nothing.
export function useNoDataText () {
  const { t } = useI18n()

  function noDataText ({ search, loading } = {}) {
    if (loading) { return t('common.loading') }
    if (!search) { return t('common.type_to_search') }
    return t('common.no_data')
  }

  return { noDataText }
}
