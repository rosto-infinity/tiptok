<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { tokensApi } from '@/api/tokens.api'
import { useToastStore } from '@/stores/toast.store'
import type { UserToken } from '@/types/user'
import { Smartphone, Laptop, Trash2, Loader2 } from 'lucide-vue-next'

const toastStore = useToastStore()
const tokens = ref<UserToken[]>([])
const isLoading = ref(true)
const isRevokingOther = ref(false)
const revokingId = ref<number | null>(null)
const fetchTokens = async () => {
  isLoading.value = true
  try {
    tokens.value = await tokensApi.listTokens()
  } catch {
    toastStore.error('Erreur lors du chargement des sessions actives.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTokens()
})

const handleRevoke = async (tokenId: number) => {
  if (!confirm('Voulez-vous révoquer l’accès pour cet appareil ?')) return
  revokingId.value = tokenId

  try {
    await tokensApi.revokeToken(tokenId)
    toastStore.success('Session révoquée avec succès.')
    tokens.value = tokens.value.filter((t) => t.id !== tokenId)
  } catch {
    toastStore.error('Impossible de révoquer ce token.')
  } finally {
    revokingId.value = null
  }
}

const handleRevokeOthers = async () => {
  if (!confirm('Voulez-vous déconnecter tous vos autres appareils connectés ?')) return
  isRevokingOther.value = true

  try {
    await tokensApi.revokeOtherTokens()
    toastStore.success('Toutes les autres sessions ont été révoquées.')
    tokens.value = tokens.value.filter((t) => t.is_current)
  } catch {
    toastStore.error('Erreur lors de la révocation des autres sessions.')
  } finally {
    isRevokingOther.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
          Appareils & Sessions actives
        </h1>
        <p class="text-sm text-text-secondary mt-1">
          Surveillez les jetons d'accès et appareils connectés à votre compte TipTok
        </p>
      </div>

      <button
        v-if="tokens.length > 1"
        @click="handleRevokeOthers"
        :disabled="isRevokingOther"
        class="px-3.5 py-2 rounded-lg text-xs font-semibold text-danger hover:bg-danger-bg border border-danger-border/40 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
      >
        <Loader2 v-if="isRevokingOther" class="w-3.5 h-3.5 animate-spin" />
        <Trash2 v-else class="w-3.5 h-3.5" />
        <span>Déconnecter les autres appareils</span>
      </button>
    </div>

    <!-- Liste des tokens/appareils -->
    <div class="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
      <div v-if="isLoading" class="p-8 text-center text-text-muted text-xs flex items-center justify-center gap-2">
        <Loader2 class="w-4 h-4 animate-spin text-primary" />
        <span>Chargement des sessions...</span>
      </div>

      <div v-else-if="tokens.length === 0" class="p-8 text-center text-text-muted text-xs">
        Aucun jeton de session actif trouvé.
      </div>

      <div
        v-for="token in tokens"
        :key="token.id"
        class="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-hover/50 transition-colors"
      >
        <div class="flex items-center gap-3.5">
          <div class="p-2.5 rounded-lg bg-surface-elevated border border-border text-text-secondary">
            <Laptop v-if="token.name.toLowerCase().includes('mac') || token.name.toLowerCase().includes('web')" class="w-5 h-5" />
            <Smartphone v-else class="w-5 h-5" />
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-text-primary">
                {{ token.name }}
              </span>
              <span
                v-if="token.is_current"
                class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-subtle text-primary border border-primary/20"
              >
                Cet appareil (Actif)
              </span>
            </div>

            <div class="flex items-center gap-2 text-xs text-text-muted mt-0.5">
              <span>Créé le {{ new Date(token.created_at).toLocaleDateString('fr-FR') }}</span>
              <span v-if="token.last_used_at">• Vu récemment</span>
            </div>
          </div>
        </div>

        <button
          v-if="!token.is_current"
          @click="handleRevoke(token.id)"
          :disabled="revokingId === token.id"
          class="p-2 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg border border-transparent hover:border-danger-border transition-colors cursor-pointer"
          title="Révoquer l'accès"
        >
          <Loader2 v-if="revokingId === token.id" class="w-4 h-4 animate-spin" />
          <Trash2 v-else class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
