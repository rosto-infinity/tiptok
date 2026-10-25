<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import TipTokLogo from '@/components/common/TipTokLogo.vue'
import { Search, Smartphone } from 'lucide-vue-next'

const authStore = useAuthStore()
const searchQuery = ref('')
const emit = defineEmits<{
  (e: 'search', query: string): void
}>()

const handleSearch = () => {
  emit('search', searchQuery.value)
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full h-15 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between select-none shrink-0">
    <!-- Logo TipTok (Icône à gauche + Titre à droite) -->
    <RouterLink to="/" class="flex items-center hover:opacity-90 transition-opacity">
      <TipTokLogo size="sm" />
    </RouterLink>

    <!-- Barre de recherche centrale style TikTok -->
    <div class="hidden sm:flex items-center flex-1 max-w-md mx-6">
      <div class="relative w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher"
          @keyup.enter="handleSearch"
          class="w-full pl-4 pr-10 py-2.5 rounded-full bg-surface-hover border border-border text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-hover transition-colors"
        />
        <button
          @click="handleSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
        >
          <Search class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Actions à droite -->
    <div class="flex items-center gap-3">
      <button class="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-hover hover:bg-surface-elevated border border-border text-xs font-semibold text-text-primary transition-colors cursor-pointer">
        <Smartphone class="w-3.5 h-3.5" />
        <span>Obtenir l'application</span>
      </button>

      <!-- Bouton Se connecter / Avatar -->
      <template v-if="!authStore.isAuthenticated">
        <RouterLink
          to="/login"
          class="px-5 py-2 rounded-md bg-primary text-primary-content text-sm font-bold hover:bg-primary-hover active:scale-[0.99] transition-all cursor-pointer shadow-xs"
        >
          Se connecter
        </RouterLink>
      </template>
      <template v-else>
        <RouterLink
          to="/dashboard"
          class="flex items-center gap-2 pl-2 cursor-pointer"
          title="Mon compte"
        >
          <img
            :src="authStore.user?.avatar_url"
            alt="Avatar"
            class="w-8 h-8 rounded-full border border-border object-cover"
          />
        </RouterLink>
      </template>
    </div>
  </header>
</template>
