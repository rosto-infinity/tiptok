import { createRouter, createWebHistory } from 'vue-router'

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
  const token = localStorage.getItem('tiptok_token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
