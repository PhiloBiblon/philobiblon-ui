import axios from 'axios';
import App from './App.vue';
import Pusher from 'pusher-js';
import Echo from 'laravel-echo';
import { createApp } from 'vue';
import { createPinia } from 'pinia'
import '../public/assets/css/main.css';
import router from "./router/index.js";
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.baseURL = process.env.VUE_APP_API_URL;
axios.defaults.headers.common["Accept"] = "application/json";

const pinia = createPinia()
const app = createApp(App);

app.use(pinia)
app.use(router);
app.use(VueSweetalert2);
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
// Make sure `window` is available to use
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.VUE_APP_PUSHER_APP_KEY,
    cluster: process.env.VUE_APP_PUSHER_APP_CLUSTER,
    encrypted: true,
});
app.mount('#app');