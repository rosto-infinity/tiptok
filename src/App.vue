<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const route = useRoute()
const authStore = useAuthStore()

// Masquer uniquement sur l'accueil immersif (HomeView possède son propre HomeHeader + HomeSidebar)
const showGlobalNavbar = computed(() => {
  return route.name !== 'home'
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
    <!-- Navbar globale (affichée sur login, register, 2fa, dashboard et paramètres) -->
    <AppNavbar v-if="showGlobalNavbar" />

    <!-- Vue de la page active -->
    <main class="flex-1 flex flex-col">
      <RouterView />
    </main>

    <!-- Système de notifications Toasts -->
    <ToastContainer />
  </div>
</template>
