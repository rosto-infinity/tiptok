<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { tokensApi } from '@/api/tokens.api'
import type { UserToken } from '@/types/user'
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  User as UserIcon,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const activeTokens = ref<UserToken[]>([])
const isLoadingTokens = ref(true)

onMounted(async () => {
  try {
    activeTokens.value = await tokensApi.listTokens()
  } catch (err) {
    // Non blocking
  } finally {
    isLoadingTokens.value = false
  }
})

const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8006'
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
    <!-- En-tête profil rapide -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
      <div class="flex items-center gap-4">
        <img
          :src="authStore.user?.avatar_url"
          :alt="authStore.user?.name"
          class="w-14 h-14 rounded-full border-2 border-border object-cover bg-surface-elevated"
        />
        <div>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
            {{ authStore.user?.name }}
          </h1>
          <p class="text-sm text-text-secondary">
            {{ authStore.user?.email }}
            <span v-if="authStore.user?.phone" class="ml-2 text-text-muted">• {{ authStore.user?.phone }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <RouterLink
          to="/settings/profile"
          class="px-4 py-2 rounded-lg text-xs font-semibold bg-surface border border-border text-text-primary hover:bg-surface-hover hover:border-border-hover transition-colors"
        >
          Modifier le profil
        </RouterLink>
      </div>
    </div>

    <!-- Grille des statuts réels du compte (Anti-Slop : données authentiques uniquement) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Statut 2FA -->
      <div class="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Double facteur (2FA)</span>
            <span
              :class="[
                authStore.user?.two_factor_enabled
                  ? 'text-success bg-success-bg border-success-border'
                  : 'text-warning bg-warning-bg border-warning-border',
                'px-2 py-0.5 rounded text-[11px] font-bold border',
              ]"
            >
              {{ authStore.user?.two_factor_enabled ? 'Activé' : 'Désactivé' }}
            </span>
          </div>
          <p class="text-xs text-text-secondary leading-relaxed">
            {{
              authStore.user?.two_factor_enabled
                ? 'Votre compte bénéficie d’une protection TOTP active.'
                : 'Protégez vos accès avec Google Authenticator ou une application compatible.'
            }}
          </p>
        </div>
        <RouterLink
          to="/settings/security"
          class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          {{ authStore.user?.two_factor_enabled ? 'Gérer les codes de secours' : 'Activer maintenant' }}
          <ArrowRight class="w-3.5 h-3.5" />
        </RouterLink>
      </div>

      <!-- Statut Appareils & Sessions -->
      <div class="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Sessions actives</span>
            <span class="text-xs font-mono font-bold text-text-primary px-2 py-0.5 rounded bg-surface-elevated border border-border">
              {{ isLoadingTokens ? '...' : `${activeTokens.length} session(s)` }}
            </span>
          </div>
          <p class="text-xs text-text-secondary leading-relaxed">
            Gérez vos jetons d'accès personnels et déconnectez vos anciens appareils en un clic.
          </p>
        </div>
        <RouterLink
          to="/settings/devices"
          class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          Consulter les appareils
          <ArrowRight class="w-3.5 h-3.5" />
        </RouterLink>
      </div>

      <!-- Statut API & Documentation -->
      <div class="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Backend API (8006)</span>
            <span class="text-[11px] font-mono text-primary bg-primary-subtle px-2 py-0.5 rounded border border-primary/20">
              Actif
            </span>
          </div>
          <p class="text-xs text-text-secondary leading-relaxed">
            Consultez les spécifications OpenAPI Scramble générées directement par le backend Laravel.
          </p>
        </div>
        <a
          :href="`${backendUrl}/docs/api`"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          Ouvrir la doc API Scramble
          <ExternalLink class="w-3.5 h-3.5" />
        </a>
      </div>
    </div>

    <!-- Détails des informations de compte -->
    <div class="bg-surface border border-border rounded-xl p-6">
      <h2 class="text-base font-bold text-text-primary mb-4 pb-2 border-b border-border">
        Informations du compte TipTok
      </h2>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
        <div>
          <dt class="text-text-muted">Identifiant unique (ID)</dt>
          <dd class="text-text-primary font-mono mt-0.5 font-medium">#{{ authStore.user?.id }}</dd>
        </div>
        <div>
          <dt class="text-text-muted">Email officiel</dt>
          <dd class="text-text-primary font-medium mt-0.5">{{ authStore.user?.email }}</dd>
        </div>
        <div>
          <dt class="text-text-muted">Numéro de téléphone</dt>
          <dd class="text-text-primary font-medium mt-0.5">{{ authStore.user?.phone || 'Non renseigné' }}</dd>
        </div>
        <div>
          <dt class="text-text-muted">Date d'inscription</dt>
          <dd class="text-text-primary font-medium mt-0.5">
            {{ authStore.user?.created_at ? new Date(authStore.user.created_at).toLocaleString('fr-FR') : '-' }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
