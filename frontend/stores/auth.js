import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isLogged = ref(false)
  const username = ref(null)
  const accessToken = ref(null)

  function login ({ username: u, accessToken: t }) {
    username.value = u
    accessToken.value = t
    isLogged.value = true
  }

  function logout () {
    username.value = null
    accessToken.value = null
    isLogged.value = false
  }

  const requestConfig = computed(() => ({
    credentials: {
      oauth: {
        token: accessToken.value?.token
      }
    }
  }))

  const authHeaders = computed(() => ({
    Authorization: `OAuth oauth_token="${accessToken.value?.token}", oauth_token_secret="${accessToken.value?.tokenSecret}"`
  }))

  return {
    isLogged,
    username,
    accessToken,
    login,
    logout,
    requestConfig,
    authHeaders
  }
})
