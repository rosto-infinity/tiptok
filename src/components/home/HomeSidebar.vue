<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import {
  Home,
  Compass,
  Users,
  Clapperboard,
  Radio,
  User as UserIcon,
  MoreHorizontal,
} from 'lucide-vue-next'

const authStore = useAuthStore()
</script>

<template>
  <aside class="hidden md:flex flex-col w-60 shrink-0 border-r border-border p-3 sticky top-15 h-[calc(100vh-60px)] overflow-y-auto select-none justify-between">
    <div class="space-y-1">
      <!-- Item Actif : Pour toi -->
      <RouterLink
        to="/"
        class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-bold text-primary bg-primary-subtle transition-colors"
      >
        <Home class="w-5 h-5 text-primary" />
        <span>Pour toi</span>
      </RouterLink>

      <a href="#" class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
        <Compass class="w-5 h-5" />
        <span>Explorer</span>
      </a>

      <a href="#" class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
        <Users class="w-5 h-5" />
        <span>Suivis</span>
      </a>

      <a href="#" class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
        <Clapperboard class="w-5 h-5" />
        <span>Mini-dramas</span>
      </a>

      <a href="#" class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
        <Radio class="w-5 h-5" />
        <span>LIVE</span>
      </a>

      <RouterLink
        v-if="authStore.isAuthenticated"
        to="/settings/profile"
        class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
      >
        <UserIcon class="w-5 h-5" />
        <span>Profil</span>
      </RouterLink>

      <a href="#" class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
        <MoreHorizontal class="w-5 h-5" />
        <span>Plus</span>
      </a>

      <!-- Bloc Connexion Sidebar pour invités -->
      <div v-if="!authStore.isAuthenticated" class="pt-5 pb-2 px-2 border-t border-border mt-3">
        <p class="text-xs text-text-muted leading-relaxed mb-3">
          Connecte-toi pour suivre des créateurs, aimer des vidéos et voir les commentaires.
        </p>
        <RouterLink
          to="/login"
          class="w-full flex items-center justify-center py-2.5 rounded-lg bg-primary text-primary-content text-sm font-bold hover:bg-primary-hover transition-all cursor-pointer"
        >
          Se connecter
        </RouterLink>
      </div>
    </div>

    <!-- Liens Footer Sidebar -->
    <div class="text-[11px] text-text-muted space-y-2 pt-4 border-t border-border px-2">
      <div class="flex flex-wrap gap-x-2 gap-y-1">
        <a href="#" class="hover:underline">Entreprise</a>
        <a href="#" class="hover:underline">Programme</a>
        <a href="#" class="hover:underline">Conditions générales</a>
      </div>
      <p>© 2026 TipTok</p>
    </div>
  </aside>
</template>
