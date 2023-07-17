export class OAuthService {
  constructor (store, config) {
    this.$store = store
    this.$config = config
  }

  step1 () {
    fetch(`${this.$config.apiBaseUrl}/api/oauth/request-token`)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        // replace internal host, only for local development
        window.location.href = data.authUrl.replace('host.docker.internal', 'localhost')
      })
  }

  async step3 (oauthToken, oauthVerifier) {
    const response = await fetch(`${this.$config.apiBaseUrl}/api/oauth/access-token?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message)
          })
        }
        return response.json()
      })
      .then((accessToken) => {
        return {
          status: 0,
          accessToken
        }
      })
      .catch((error) => {
        return {
          status: 1,
          error
        }
      })
    if (response.status === 0) {
      const accessToken = response.accessToken
      const username = await this.getUsername(accessToken)
      this.$store.commit('auth/login', { username, accessToken })
    }
    return response
  }

  getUsername (accessToken) {
    return fetch(`${this.$config.apiBaseUrl}/api/oauth/username?oauth_token=${accessToken.token}&oauth_tokensecret=${accessToken.tokenSecret}`)
      .then((response) => {
        return response.text()
      })
      .then((data) => {
        return data
      })
  }
}
