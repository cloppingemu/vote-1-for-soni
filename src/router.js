import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/LoginPage.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    props: true
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutPage.vue'),
  },
  {
    path: '/vote',
    name: 'Vote',
    component: () => import(/* webpackChunkName: "vote" */ '@/views/VotePage.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/AdminPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'FourO4',
    component: () => import(/* webpackChunkName: "fourO4" */ "@/views/ViewNotFound.vue")
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
