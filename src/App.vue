<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const route = useRoute()
const authStore = useAuthStore()

// Masquer la navbar globale sur les pages d'authentification dédiées (register & login)
const showGlobalNavbar = computed(() => {
  return route.name !== 'register' && route.name !== 'login' && route.name !== 'two-factor-challenge'
})

onMounted(() => {
  if (authStore.token) {
    authStore.fetchUser().catch(() => {
      // Token expiré ou révoqué
    })
  }
})
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary flex flex-col">
    <!-- Navbar globale (affichée uniquement sur le dashboard et les paramètres) -->
    <AppNavbar v-if="showGlobalNavbar" />

    <!-- Vue de la page active -->
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>

    <!-- Système de notifications Toasts -->
    <ToastContainer />
  </div>
</template>
