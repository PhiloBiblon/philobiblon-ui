import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBreadcrumbStore = defineStore('breadcrumb', () => {
  const items = ref([])
  const cssClass = ref('')
  const database = ref('')
  const table = ref('')

  function addItem (item) {
    items.value.push(item)
  }

  function setItems (newItems) {
    items.value = JSON.parse(JSON.stringify(newItems))
  }

  function setClass (style) {
    cssClass.value = style
  }

  function setDatabase (db) {
    database.value = db
  }

  function setTable (t) {
    table.value = t
  }

  function resetItems () {
    items.value = []
    database.value = ''
    table.value = ''
  }

  return {
    items,
    class: cssClass,
    database,
    table,
    addItem,
    setItems,
    setClass,
    setDatabase,
    setTable,
    resetItems
  }
})
