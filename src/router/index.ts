import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/two-factor-challenge',
      name: 'two-factor-challenge',
      component: () => import('@/views/auth/TwoFactorView.vue'),
      meta: { requiresPendingTwoFactor: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings/profile',
      name: 'settings-profile',
      component: () => import('@/views/settings/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings/security',
      name: 'settings-security',
      component: () => import('@/views/settings/SecurityView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings/devices',
      name: 'settings-devices',
      component: () => import('@/views/settings/DevicesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'dashboard' })
  } else if (to.meta.requiresPendingTwoFactor) {
    if (isAuthenticated) {
      next({ name: 'dashboard' })
    } else if (!authStore.pendingTwoFactor) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
