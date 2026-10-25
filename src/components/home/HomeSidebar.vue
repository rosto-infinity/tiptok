<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import {
  Home,
  Compass,
  Users,
  User as UserIcon,
} from 'lucide-vue-next'

const authStore = useAuthStore()

const suggestedCreators = [
  {
    name: 'Taylor Otwell',
    handle: 'taylor_dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'Créateur Laravel',
  },
  {
    name: 'Eva Chen',
    handle: 'eva_vue',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    role: 'Lead Frontend Vue',
  },
  {
    name: 'Koffi Kouamé',
    handle: 'koffi_code',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    role: 'Architecte Logiciel',
  },
]

const popularTags = [
  '#laravel',
  '#vuejs',
  '#cleancode',
  '#performances',
  '#webdev',
]
</script>

<template>
  <aside class="hidden md:flex flex-col w-58 shrink-0 border-r border-border p-3 sticky top-15 h-[calc(100vh-60px)] overflow-y-auto select-none justify-between">
    <div class="space-y-5">
      <!-- 1. Navigation épurée -->
      <nav class="space-y-1">
        <RouterLink
          to="/"
          class="flex items-center gap-3.5 px-3 py-2 rounded-lg text-sm font-bold text-primary bg-primary-subtle transition-colors"
        >
          <Home class="w-5 h-5 text-primary" />
          <span>Pour toi</span>
        </RouterLink>

        <a
          href="#"
          class="flex items-center gap-3.5 px-3 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
        >
          <Compass class="w-5 h-5" />
          <span>Explorer</span>
        </a>

        <a
          href="#"
          class="flex items-center gap-3.5 px-3 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
        >
          <Users class="w-5 h-5" />
          <span>Abonnements</span>
        </a>

        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/settings/profile"
          class="flex items-center gap-3.5 px-3 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
        >
          <UserIcon class="w-5 h-5" />
          <span>Profil</span>
        </RouterLink>
      </nav>

      <!-- 2. Créateurs suggérés (compact & fluide) -->
      <div class="pt-3 border-t border-border">
        <span class="text-[11px] font-bold uppercase tracking-wider text-text-muted px-2 block mb-2">
          Comptes suggérés
        </span>
        <div class="space-y-1">
          <div
            v-for="c in suggestedCreators"
            :key="c.handle"
            class="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
          >
            <img :src="c.avatar" :alt="c.name" class="w-7 h-7 rounded-full object-cover border border-border" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-text-primary truncate">@{{ c.handle }}</p>
              <p class="text-[10px] text-text-muted truncate">{{ c.role }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Découvrir des thèmes -->
      <div class="pt-3 border-t border-border">
        <span class="text-[11px] font-bold uppercase tracking-wider text-text-muted px-2 block mb-2">
          Découvrir
        </span>
        <div class="flex flex-wrap gap-1.5 px-2">
          <span
            v-for="t in popularTags"
            :key="t"
            class="inline-block px-2.5 py-1 rounded-full text-xs text-text-secondary hover:text-primary hover:bg-primary-subtle border border-border hover:border-primary/30 transition-colors cursor-pointer"
          >
            {{ t }}
          </span>
        </div>
      </div>

      <!-- 4. Bloc Connexion pour invités (aéré) -->
      <div v-if="!authStore.isAuthenticated" class="pt-3 border-t border-border px-2">
        <p class="text-xs text-text-muted leading-relaxed mb-3">
          Connecte-toi pour suivre des créateurs, aimer des astuces et échanger.
        </p>
        <RouterLink
          to="/login"
          class="w-full flex items-center justify-center py-2 rounded-lg bg-primary text-primary-content text-sm font-bold hover:bg-primary-hover transition-all cursor-pointer shadow-xs"
        >
          Se connecter
        </RouterLink>
      </div>
    </div>

    <!-- 5. Footer minimaliste -->
    <div class="text-[11px] text-text-muted space-y-1 pt-3 border-t border-border px-2">
      <div class="flex flex-wrap gap-x-3 gap-y-0.5">
        <a href="#" class="hover:underline">À propos</a>
        <a href="#" class="hover:underline">Aide</a>
        <a href="#" class="hover:underline">Confidentialité</a>
      </div>
      <p class="text-[10px] text-text-muted">© 2026 TipTok</p>
    </div>
  </aside>
</template>
