export class OAuthService {
  constructor (store) {
    this.$store = store
  }

  step1 () {
    fetch('http://localhost:8080/api/oauth/request-token')
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        window.location.href = data.authUrl
      })
  }

  async step3 (oauthToken, oauthVerifier) {
    const accessToken = await fetch(`http://localhost:8080/api/oauth/access-token?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`)
      .then((response) => {
        return response.json()
      })
      .then((accessToken) => {
        return accessToken
      })
    const username = await this.getUsername(accessToken)
    this.$store.commit('auth/login', { username, accessToken })
    // this.edit(accessToken)
  }

  edit (accessToken) {
    const generalConfig = {
      instance: 'http://wikibase.svc',
      credentials: {
        oauth: {
          token: '8de15abb42b8f9f15444ee4f13bb1f3d',
          token_secret: '2ba1e72cb947adda5da196d5d2cc57adf12aeaec'
        }
      }
    }
    this.wbEdit = require('wikibase-edit')(generalConfig)
    const requestOauth = {
      consumer_key: 'cb04538158d22e03b01fe9d5a93a3418',
      consumer_secret: 'ff198788b4c627016c76538d74c2e248077bfe7f',
      token: accessToken.token,
      token_secret: accessToken.tokenSecret
    }
    const requestConfig = {
      credentials: {
        oauth: requestOauth
      }
    }
    this.wbEdit.label.set({ id: 'Q35702', language: 'ca', value: 'Universitat de Salamanca' }, requestConfig)
  }

  getUsername (accessToken) {
    return fetch(`http://localhost:8080/api/oauth/username?oauth_token=${accessToken.token}&oauth_tokensecret=${accessToken.tokenSecret}`)
      .then((response) => {
        return response.text()
      })
      .then((data) => {
        return data
      })
  }
}
