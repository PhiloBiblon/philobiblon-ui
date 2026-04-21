import { WikibaseService } from '~/service/wikibase.service'
import { useQueryCacheStore } from '~/stores/queryCache'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public
  const wikibaseService = new WikibaseService({
    config,
    $notification: nuxtApp.$notification
  })

  // Interval to clear query cache
  setInterval(() => {
    useQueryCacheStore().clearCache()
  }, 3000)

  return {
    provide: {
      wikibase: wikibaseService
    }
  }
})
