import { createRouter, createWebHistory } from 'vue-router';
import Register from "../components/Pages/Register.vue";
import Proposes from "../components/Pages/Proposes.vue";
import Users from "../components/Pages/Users.vue";
import Login from "../components/Pages/Login.vue";
import OauthCallback from "../components/Pages/OauthCallback.vue";
import { isLogged } from "../utils/auth.js";
const routes = [
    {
        path: '/',
        name: 'main',
        component: Proposes,
        meta: { requiresAuth: true },
    },
    {
        path: '/admin/proposes',
        name: 'proposes',
        component: Proposes,
        meta: { requiresAuth: true },
    },
    // {
    //     path: '/admin/users',
    //     name: 'users',
    //     component: Users,
    //     meta: { requiresAuth: true },
    // },
    // {
    //     path: '/admin/register',
    //     name: 'register',
    //     component: Register
    // },
    // {
    //     path: '/admin/login',
    //     name: 'login',
    //     component: Login,
    // },
    {
        path: '/oauth_callback',
        name: 'OauthCallback',
        component: OauthCallback,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isLogged()) {
        next({ name: 'login' });
    } else {
        next();
    }
});
export default router;
