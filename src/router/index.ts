import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PlayerView from '@/views/PlayerView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/player/:tag', component: PlayerView },
    { path: '/tier', component: () => import('@/views/TierView.vue') },
    { path: '/king', component: () => import('@/views/KingView.vue') },
    { path: '/king/batch', component: () => import('@/views/BatchMonitorView.vue') },
    { path: '/king/data', component: () => import('@/views/DbStatsView.vue') }
  ]
})
