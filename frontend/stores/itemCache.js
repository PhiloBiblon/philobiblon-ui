import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useItemCacheStore = defineStore('itemCache', () => {
  const cache = reactive({})

  function addEntry ({ key, value }) {
    cache[key] = value
  }

  return { cache, addEntry }
})
