export const state = () => ({
  propose: null
})

export const mutations = {
  SET_PROPOSE (state, propose) {
    state.propose = propose
  }
}

export const actions = {
  async getPropose ({ commit }, payload) {
    await this.$axios.get(`${this.$config.adminApiUrl}/api/admin/propose`, payload)
      .then((res) => {
        if (res.data.success) {
          commit('SET_PROPOSE', res.data.propose)
        }

        return null
      }).catch((e) => {
        this.$notification.error(e.message)
      })
  },
  async propose ({ commit }, payload) {
    await this.$axios.post(`${this.$config.adminApiUrl}/api/admin/propose`, payload)
      .then((res) => {
        this.$notification.success(res.data.message)
      }).catch((e) => {
        this.$notification.error(e.message)
      })
  }
}

export const getters = {
  getPropose (state) {
    return state.propose
  }
}
