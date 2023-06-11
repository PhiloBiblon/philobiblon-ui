export const state = () => ({
  currentTable: null,
  showResults: null,
  currentPage: 1,
  sortBy: 'name',
  isSortDescending: false,
  form: null
})

export const mutations = {
  setShowResults (state, showResults) {
    state.showResults = showResults
  },
  setPage (state, page) {
    state.currentPage = page
  },
  setSortBy (state, sortBy) {
    state.sortBy = sortBy
  },
  setSortDescending (state, isSortDescending) {
    state.isSortDescending = isSortDescending
  },
  setForm (state, form) {
    state.form = form
  },
  resetStatus (state, table) {
    state.currentTable = table
    state.showResults = false
    state.currentPage = 1
    state.sortBy = 'name'
    state.isSortDescending = false
    state.form = null
  }
}
