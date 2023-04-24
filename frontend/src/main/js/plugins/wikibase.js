import { WikibaseService } from '~/service/wikibase.service'
import { QueryService } from '~/service/query.service'
import { OAuthService } from '~/service/oauth.service'

export default ({ store }, inject) => {
  const queryService = new QueryService(store)
  const oauthService = new OAuthService(store)
  const wikibaseService = new WikibaseService(store, queryService, oauthService)

  inject('wikibase', wikibaseService)
  inject('query', queryService)

  // Interval to clear query cache
  setInterval(function () {
    store.dispatch('queryCache/clearCache')
  }, 3000)
}
