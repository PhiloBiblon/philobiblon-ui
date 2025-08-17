import { defineStore } from 'pinia';
import axios from 'axios';

export const useProposeStore = defineStore('ProposeStore', {
    state: () => {
        return {
            proposes: {}
        }
    },
    actions: {
        get(filters) {
            return axios.get('/api/admin/propose/all',{params: filters}).then((res) => {
                if (res.data.success && res.data.propose) {
                    this.proposes = res.data.propose
                }
            })
        },
        approve(id) {
            return axios.put(`/api/admin/propose/${id}`).then((res) => {
                return res
            })
        },
        delete(id) {
            return axios.delete(`/api/admin/propose/${id}`).then((res) => {
                return res
            })
        }
    }
})
