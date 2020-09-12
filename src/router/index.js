import Vue from "vue"
import VueRouter from "vue-router"

import Login from "@/views/Login.vue"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login
  },
  {
    path: "/about",
    name: "About",
    component: () => import(/* webpackChunkName: "about" */ "@/views/About.vue"),
    props: true
  },
  {
    path: "/vote",
    name: "Vote",
    component: () => import(/* webpackChunkName: "vote" */ "@/views/Vote.vue"),
    props: true
  },
  {
    path: "*",
    name: "404",
    component: () => import(/* webpackChunkName: "four0four" */ "@/views/ViewNotFound.vue"),
    props: true
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import(/* webpackChunkName: "admin" */ "@/views/Admin.vue"),
    props: true
  }
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
})

export default router
