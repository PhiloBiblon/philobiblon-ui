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
        window.location.href = data.authUrl
      })
  }

  async step3 (oauthToken, oauthVerifier) {
    const accessToken = await fetch(`${this.$config.apiBaseUrl}/api/oauth/access-token?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`)
      .then((response) => {
        return response.json()
      })
      .then((accessToken) => {
        return accessToken
      })
    const username = await this.getUsername(accessToken)
    this.$store.commit('auth/login', { username, accessToken })
    this.edit(accessToken)
  }

  edit (accessToken) {
    const generalConfig = {
      instance: 'http://localhost:8080'
    }
    this.wbEdit = require('wikibase-edit')(generalConfig)
    const requestOauth = {
      token: accessToken.token
    }
    const requestConfig = {
      credentials: {
        oauth: requestOauth
      }
    }
    this.wbEdit.label.set({ id: 'Q35702', language: 'ca', value: 'Universitat de Salamanca' }, requestConfig)
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
