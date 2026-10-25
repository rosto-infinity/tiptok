<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import TipTokLogo from '@/components/common/TipTokLogo.vue'
import { ArrowRight, KeyRound, Loader2, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const useRecoveryCode = ref(false)
const code = ref('')
const recoveryCode = ref('')
const generalError = ref<string | null>(null)

const handleSubmit = async () => {
  generalError.value = null

  try {
    await authStore.twoFactorChallenge({
      code: useRecoveryCode.value ? undefined : code.value,
      recovery_code: useRecoveryCode.value ? recoveryCode.value : undefined,
    })

    toastStore.success('Authentification à double facteur validée.')
    router.push('/dashboard')
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 422) {
      generalError.value = 'Code invalide ou expiré. Veuillez réessayer.'
    } else if (axios.isAxiosError(err) && err.response?.data?.message) {
      generalError.value = err.response.data.message
    } else {
      generalError.value = 'Erreur lors de la validation.'
    }
  }
}
</script>

<template>
  <div class="min-h-[85vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <TipTokLogo size="lg" />
        </div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-subtle text-primary text-xs font-semibold mb-3">
          <ShieldCheck class="w-3.5 h-3.5" />
          Sécurité renforcée
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-text-primary">
          Validation à deux facteurs
        </h1>
        <p class="text-sm text-text-secondary mt-1">
          {{ useRecoveryCode ? 'Entrez un de vos codes de secours' : 'Entrez le code à 6 chiffres généré par votre application' }}
        </p>
      </div>

      <div class="bg-surface border border-border rounded-xl p-6 sm:p-8">
        <div
          v-if="generalError"
          class="mb-5 p-3 rounded-md bg-danger-bg border border-danger-border text-danger text-sm"
        >
          {{ generalError }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="!useRecoveryCode">
            <label for="totp" class="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Code d'authentification (6 chiffres)
            </label>
            <input
              id="totp"
              v-model="code"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              required
              autofocus
              placeholder="123456"
              class="w-full px-4 py-3 rounded-lg bg-background border border-border text-text-primary text-center font-mono text-xl tracking-[0.3em] transition-colors focus:border-primary"
            />
          </div>

          <div v-else>
            <label for="recovery" class="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Code de récupération d'urgence
            </label>
            <div class="relative">
              <KeyRound class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="recovery"
                v-model="recoveryCode"
                type="text"
                required
                autofocus
                placeholder="xxxx-xxxx-xxxx"
                class="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-background border border-border text-text-primary font-mono text-sm transition-colors focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-content font-bold text-sm hover:bg-primary-hover active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Loader2 v-if="authStore.isLoading" class="w-4 h-4 animate-spin" />
            <span v-else>Confirmer</span>
            <ArrowRight v-if="!authStore.isLoading" class="w-4 h-4" />
          </button>
        </form>

        <div class="mt-5 pt-4 border-t border-border flex justify-between items-center text-xs">
          <button
            type="button"
            @click="useRecoveryCode = !useRecoveryCode"
            class="text-text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            {{ useRecoveryCode ? "Utiliser l'application d'authentification" : 'Utiliser un code de secours' }}
          </button>

          <RouterLink
            to="/login"
            class="text-text-muted hover:text-text-primary transition-colors"
          >
            Annuler
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
