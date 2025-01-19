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

export const getters = {
  getRequestConfig (state) {
    return {
      credentials: {
        oauth: {
          token: state.accessToken.token
        }
      }
    }
  },
  getAuthHeaders (state) {
    return {
      Authorization: `OAuth oauth_token="${state.accessToken.token}", oauth_token_secret="${state.accessToken.tokenSecret}"`
    }
  }
}
