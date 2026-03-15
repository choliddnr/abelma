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
      path: '/words',
      name: 'word-landing',
      component: () => import('../views/WordLandingView.vue'),
    },
    {
      path: '/words/learn',
      name: 'word-dashboard',
      component: () => import('../views/WordDashboardView.vue'),
    },
    {
      path: '/words/quiz',
      name: 'word-quiz',
      component: () => import('../views/WordQuizView.vue'),
    },
    {
      path: '/words/settings',
      name: 'word-settings',
      component: () => import('../views/WordSettingsView.vue'),
    },
    {
      path: '/words/stickers',
      name: 'word-stickers',
      component: () => import('../views/StickerGalleryView.vue'),
    },
    {
      path: '/words/rewards',
      name: 'word-rewards',
      component: () => import('../views/RewardShopView.vue'),
    },
    {
      path: '/words/settings/rewards',
      name: 'word-parent-rewards',
      component: () => import('../views/ParentRewardView.vue')
    },
    {
      path: '/parent',
      name: 'parent-dashboard',
      component: () => import('../views/ParentDashboardView.vue')
    },
    {
      path: '/words/:category/:word',
      name: 'word-detail',
      component: () => import('../views/WordDetailView.vue'),
    },
    {
      path: '/words/:category/:word/exercise',
      name: 'word-exercise',
      component: () => import('../views/WordChallengeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
  ],
})

export default router
