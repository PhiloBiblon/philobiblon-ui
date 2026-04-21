import jwt from 'jsonwebtoken'
import { useAuthStore } from '~/stores/auth'

export class OAuthService {
  constructor ({ config }) {
    this.$config = config
    this.oauthCookie = useCookie('oauth', { path: '/', maxAge: 60 * 60 })
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
      useAuthStore().login({ username, accessToken })
      const oauth = {
        username,
        accessToken
      }
      const signer = 'password'
      this.oauthCookie.value = jwt.sign(oauth, signer)
    }
    return response
  }

  autoLoginByCookie () {
    const token = this.oauthCookie.value
    try {
      const decoded = jwt.verify(token, 'password')
      const username = decoded.username
      const accessToken = decoded.accessToken
      useAuthStore().login({ username, accessToken })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
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
