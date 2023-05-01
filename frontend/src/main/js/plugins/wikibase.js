import { WikibaseService } from '~/service/wikibase.service'

export default ({ app, store }, inject) => {
  const wikibaseService = new WikibaseService(app, store)

  inject('wikibase', wikibaseService)

  // Interval to clear query cache
  setInterval(function () {
    store.dispatch('queryCache/clearCache')
  }, 3000)
}
