export const state = () => ({
  cache: {}
})

export const mutations = {
  addEntry (state, { key, value }) {
    state.cache[key] = value
  }
}
