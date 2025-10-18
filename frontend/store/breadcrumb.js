export const state = () => ({
  items: [],
  class: '',
  database: '',
  table: ''
})

export const mutations = {
  addItem (state, item) {
    state.items.push(item)
  },
  setItems (state, items) {
    state.items = JSON.parse(JSON.stringify(items))
  },
  setClass (state, style) {
    state.class = style
  },
  setDatabase (state, database) {
    state.database = database
  },
  setTable (state, table) {
    state.table = table
  },
  resetItems (state) {
    state.items = []
    state.database = ''
    state.table = ''
  }
}
