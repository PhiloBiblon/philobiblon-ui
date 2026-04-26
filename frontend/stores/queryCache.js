import { defineStore } from 'pinia'
import { reactive } from 'vue'

const CACHE_MAX_ENTRIES = 100
const CACHE_EXPIRATION_MILLIS = 120000

export const useQueryCacheStore = defineStore('queryCache', () => {
  const cache = reactive({})

  function addEntry ({ key, value }) {
    if (Object.keys(cache).length >= CACHE_MAX_ENTRIES) {
      const oldestKey = Object.entries(cache).sort((a, b) => a[1].time - b[1].time)[0][0]
      delete cache[oldestKey]
       
      console.log(`old ${oldestKey}'s cache deleted`)
    }
    cache[key] = { time: new Date(), value }
  }

  function clearCache () {
    if (Object.keys(cache).length > 0) {
      const currentTime = new Date()
      Object.keys(cache).forEach((key) => {
        const millis = currentTime - cache[key].time
        if (millis > CACHE_EXPIRATION_MILLIS) {
          delete cache[key]
           
          console.log(`${key}'s cache deleted`)
        }
      })
    }
  }

  return { cache, addEntry, clearCache }
})
