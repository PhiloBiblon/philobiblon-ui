import axios from 'axios';
import {defineStore} from 'pinia';

export const useUserStore = defineStore('UserStore', {
    state: () => {
        return {
            auth: null,
            users: {}
        }
    },
    actions: {
        login(data) {
            return axios.post('/api/admin/auth/login', data).then((res) => {
                localStorage.setItem('token', res.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            })
                .catch(error => {
                });
        },
        logout() {
            axios.post('/api/admin/auth/logout').then(() => {
                localStorage.removeItem('token');
                this.auth = null
                window.location.href = '/admin/login';
            });
        },
        getAuth() {
            axios.get('/api/admin/auth').then((res) => {
                if (res.data.data) {
                    this.auth = res.data.data
                }
            }).catch(error => {
                console.log(error);
            });
        },
        get(filters) {
            return axios.get('/api/admin/users', {params: filters}).then((res) => {
                if (res.data.success && res.data.data) {
                    this.users = res.data.data
                }
            })
        },
        createUser(data) {
            return axios.post(`/api/admin/users`, data).then((res) => {
                return res
            })
        },
        updateUser(id, data) {
            return axios.put(`/api/admin/users/${id}`, data).then((res) => {
                return res
            })
        },
        deleteUser(id) {
            return axios.delete(`/api/admin/users/${id}`).then((res) => {
                return res
            })
        },
    }
})
