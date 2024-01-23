import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/mining',
    name: 'mining',
    component: () => import('../views/MiningView.vue')
  },
  {
    path: '/build',
    name: 'build',
    component: () => import('../views/BuildView.vue'),
    meta: {
      hideNav: true
    }
  },
  {
    path: '/marketPlace',
    name: 'marketPlace',
    component: () => import('../views/MarketPlaceView.vue')
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    component: () => import('../views/PortfolioView.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
