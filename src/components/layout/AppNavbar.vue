<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import TipTokLogo from '@/components/common/TipTokLogo.vue'
import { User, Shield, Smartphone, LogOut, Menu, X } from 'lucide-vue-next'

const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()

const isMobileMenuOpen = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  toastStore.info('Vous avez été déconnecté avec succès.')
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-border bg-surface select-none">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Logo TipTok -->
      <RouterLink to="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <TipTokLogo size="sm" />
      </RouterLink>

      <!-- Navigation Desktop (Connecté) -->
      <nav v-if="authStore.isAuthenticated" class="hidden md:flex items-center gap-1">
        <RouterLink
          to="/dashboard"
          class="px-3.5 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          active-class="!text-primary !bg-primary-subtle"
        >
          Tableau de bord
        </RouterLink>
        <RouterLink
          to="/settings/profile"
          class="px-3.5 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          active-class="!text-primary !bg-primary-subtle"
        >
          Profil
        </RouterLink>
        <RouterLink
          to="/settings/security"
          class="px-3.5 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          active-class="!text-primary !bg-primary-subtle"
        >
          Sécurité & 2FA
        </RouterLink>
        <RouterLink
          to="/settings/devices"
          class="px-3.5 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          active-class="!text-primary !bg-primary-subtle"
        >
          Appareils & Sessions
        </RouterLink>
      </nav>

      <!-- Actions à droite -->
      <div class="flex items-center gap-3">
        <template v-if="authStore.isAuthenticated">
          <!-- Utilisateur connecté -->
          <div class="hidden sm:flex items-center gap-2.5 pl-2 border-l border-border">
            <img
              :src="authStore.user?.avatar_url"
              :alt="authStore.user?.name"
              class="w-8 h-8 rounded-full border border-border object-cover bg-surface-elevated"
            />
            <div class="flex flex-col text-left">
              <span class="text-xs font-semibold text-text-primary leading-tight line-clamp-1">
                {{ authStore.user?.name }}
              </span>
              <span class="text-[11px] text-text-muted leading-tight line-clamp-1">
                {{ authStore.user?.email }}
              </span>
            </div>
          </div>

          <!-- Déconnexion -->
          <button
            @click="handleLogout"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-danger hover:bg-danger-bg transition-colors border border-transparent hover:border-danger-border cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Quitter</span>
          </button>
        </template>

        <template v-else>
          <!-- Liens invités -->
          <RouterLink
            to="/login"
            class="px-3.5 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            Connexion
          </RouterLink>
          <RouterLink
            to="/register"
            class="px-4 py-1.5 rounded-md text-sm font-semibold bg-primary text-primary-content hover:bg-primary-hover transition-colors"
          >
            Créer un compte
          </RouterLink>
        </template>

        <!-- Bouton menu mobile -->
        <button
          v-if="authStore.isAuthenticated"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden p-1.5 text-text-secondary hover:text-text-primary rounded-md border border-border cursor-pointer"
          aria-label="Menu"
        >
          <X v-if="isMobileMenuOpen" class="w-5 h-5" />
          <Menu v-else class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Menu Mobile Déroulant -->
    <div
      v-if="authStore.isAuthenticated && isMobileMenuOpen"
      class="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-1"
    >
      <RouterLink
        to="/dashboard"
        @click="isMobileMenuOpen = false"
        class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        active-class="!text-primary !bg-primary-subtle"
      >
        Tableau de bord
      </RouterLink>
      <RouterLink
        to="/settings/profile"
        @click="isMobileMenuOpen = false"
        class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        active-class="!text-primary !bg-primary-subtle"
      >
        <User class="w-4 h-4" />
        Profil personnel
      </RouterLink>
      <RouterLink
        to="/settings/security"
        @click="isMobileMenuOpen = false"
        class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        active-class="!text-primary !bg-primary-subtle"
      >
        <Shield class="w-4 h-4" />
        Sécurité & Double Facteur
      </RouterLink>
      <RouterLink
        to="/settings/devices"
        @click="isMobileMenuOpen = false"
        class="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        active-class="!text-primary !bg-primary-subtle"
      >
        <Smartphone class="w-4 h-4" />
        Appareils connectés
      </RouterLink>
    </div>
  </header>
</template>
