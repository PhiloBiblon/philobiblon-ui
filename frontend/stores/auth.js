import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// Session lifetime in ms. Must stay aligned with the backend access-token TTL
// (TimedMap of 60 minutes in WikibaseOAuthServiceImpl). The backend renews its
// token on every write; this frontend value is counted from login time, so it
// is intentionally conservative (it may warn slightly early, never late).
export const SESSION_TTL_MS = 60 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
  const isLogged = ref(false)
  const username = ref(null)
  const accessToken = ref(null)
  const expiresAt = ref(null)

  function login ({ username: u, accessToken: t, expiresAt: e }) {
    username.value = u
    accessToken.value = t
    expiresAt.value = e ?? Date.now() + SESSION_TTL_MS
    isLogged.value = true
  }

  function logout () {
    username.value = null
    accessToken.value = null
    expiresAt.value = null
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
    expiresAt,
    login,
    logout,
    requestConfig,
    authHeaders
  }
})
