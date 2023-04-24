export const state = () => ({
  isLogged: false,
  username: null,
  accessToken: null
})

export const mutations = {
  login (state, { username, accessToken }) {
    state.username = username
    state.accessToken = accessToken
    state.isLogged = true
  },
  logout (state) {
    state.username = null
    state.accessToken = null
    state.isLogged = false
  }
}
