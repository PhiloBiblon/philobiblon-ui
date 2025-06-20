const CACHE_MAX_ENTRIES = 100
const CACHE_EXPIRATION_MILLIS = 120000

export const state = () => ({
  // a key-value object, where key is a query hash
  // and the value the query results
  cache: {}
})

export const mutations = {
  addEntry (state, { key, value }) {
    if (Object.keys(state.cache).length >= CACHE_MAX_ENTRIES) {
      const oldestKey = Object.entries(state.cache).sort((a, b) => a[1].time - b[1].time)[0][0]
      delete state.cache[oldestKey]
      // eslint-disable-next-line no-console
      console.log(`old ${oldestKey}'s cache deleted`)
    }
    state.cache[key] = { time: new Date(), value }
  }
}

export const actions = {
  clearCache ({ state }) {
    if (Object.keys(state.cache).length > 0) {
      const currentTime = new Date()
      Object.keys(state.cache).forEach((key) => {
        const millis = currentTime - state.cache[key].time
        if (millis > CACHE_EXPIRATION_MILLIS) {
          delete state.cache[key]
          // eslint-disable-next-line no-console
          console.log(`${key}'s cache deleted`)
        }
      })
    }
  }
}
