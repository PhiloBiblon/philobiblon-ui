const pinia = createPinia();
import { useUserStore } from '@/store/UserStore';
import Cookies from 'universal-cookie';
import { createPinia, setActivePinia } from 'pinia';

setActivePinia(pinia);

const cookies = new Cookies();
const jwt = require('jsonwebtoken');
const userStore = useUserStore();

export const isLogged = () => {

    return !!localStorage.getItem('token');
};

const auth = {
    isLogged: isLogged(),
    async step1 () {
        fetch(`${process.env.VUE_APP_PHILO_BASE_URL}/api/oauth/request-token`)
        .then((response) => {
                return response.json()
            })
                .then((data) => {
                    // replace internal host, only for local development
                    window.location.href = data.authUrl.replace('host.docker.internal', 'localhost')
                })
        },

    async step3 (oauthToken, oauthVerifier) {
        const response = await fetch(`${process.env.VUE_APP_PHILO_BASE_URL}/api/oauth/access-token?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`)
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
            userStore.auth = { username, accessToken }
            const oauth = {
                username,
                accessToken
            }
            userStore.login({username, accessToken})
            const signer = 'password'
            const token = jwt.sign(oauth, signer)
            cookies.set('oauth', token, { path: '/', maxAge: 60 * 60 });

        }
        return response
    },

    getUsername (accessToken) {
        return fetch(`${process.env.VUE_APP_PHILO_BASE_URL}/api/oauth/username?oauth_token=${accessToken.token}&oauth_tokensecret=${accessToken.tokenSecret}`)
    .then((response) => {
            return response.text()
        })
            .then((data) => {
                return data
            })
    }
}
export default auth;