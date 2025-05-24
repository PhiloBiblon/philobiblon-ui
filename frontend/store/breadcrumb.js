export const state = () => ({
  items: [],
  class: ''
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
  resetItems (state) {
    state.items = []
  }
}
