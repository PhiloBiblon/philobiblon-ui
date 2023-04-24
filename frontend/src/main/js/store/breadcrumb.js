export const state = () => ({
  items: []
})

export const mutations = {
  addItem (state, item) {
    state.items.push(item)
  },
  setItems (state, items) {
    state.items = JSON.parse(JSON.stringify(items))
  },
  resetItems (state) {
    state.items = []
  }
}
