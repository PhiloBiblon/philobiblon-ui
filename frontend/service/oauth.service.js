const jwt = require('jsonwebtoken')

export class OAuthService {
  constructor (store, config, app) {
    this.$store = store
    this.$config = config
    this.$cookies = app.$cookies
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
      const oauth = {
        username,
        accessToken
      }
      const signer = 'password'
      const token = jwt.sign(oauth, signer)
      this.$cookies.set('oauth', token, {
        path: '/',
        maxAge: 60 * 60
      })
    }
    return response
  }

  autoLoginByCookie () {
    const token = this.$cookies.get('oauth')
    try {
      const decoded = jwt.verify(token, 'password')
      const username = decoded.username
      const accessToken = decoded.accessToken
      this.$store.commit('auth/login', { username, accessToken })
    } catch (err) {
      // error logic here
    }
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
