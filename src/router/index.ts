import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LearnView from '@/views/Level/1/LearnView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/1/learn',
      name: 'level-1-learn',
      component: LearnView,
    },
    {
      path: '/alphabet',
      name: 'alphabet',
      component: () => import('../views/AlphabetView.vue'),
    },
    {
      path: '/alphabet/:id',
      name: 'alphabet-detail',
      component: () => import('../views/AlphabetDetailView.vue'),
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('../views/GamesView.vue'),
    },
    {
      path: '/learn/:id',
      name: 'word-detail',
      component: () => import('../views/WordDetailView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
