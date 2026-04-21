import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQueryStatusStore = defineStore('queryStatus', () => {
  const currentTable = ref(null)
  const showResults = ref(false)
  const currentPage = ref(1)
  const sortBy = ref('name')
  const isSortDescending = ref(false)
  const form = ref(null)

  function setShowResults (value) {
    showResults.value = value
  }

  function setPage (page) {
    currentPage.value = page
  }

  function setSortBy (value) {
    sortBy.value = value
  }

  function setSortDescending (value) {
    isSortDescending.value = value
  }

  function setForm (value) {
    form.value = value
  }

  function resetStatus (table) {
    currentTable.value = table
    showResults.value = false
    currentPage.value = 1
    sortBy.value = 'name'
    isSortDescending.value = false
    form.value = null
  }

  return {
    currentTable,
    showResults,
    currentPage,
    sortBy,
    isSortDescending,
    form,
    setShowResults,
    setPage,
    setSortBy,
    setSortDescending,
    setForm,
    resetStatus
  }
})
