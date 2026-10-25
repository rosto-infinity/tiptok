<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { userApi } from '@/api/user.api'
import { authApi } from '@/api/auth.api'
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Loader2,
  Copy,
  RefreshCw,
  Check,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toastStore = useToastStore()

// Mot de passe
const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})
const isSavingPassword = ref(false)
const passwordErrors = ref<Record<string, string[]>>({})

// 2FA Setup
const isEnablingTwoFactor = ref(false)
const isConfirmingTwoFactor = ref(false)
const isDisablingTwoFactor = ref(false)
const qrCodeSvg = ref<string | null>(null)
const secretKey = ref<string | null>(null)
const confirmationCode = ref('')
const recoveryCodes = ref<string[]>([])
const copiedCodes = ref(false)

const handleUpdatePassword = async () => {
  passwordErrors.value = {}
  isSavingPassword.value = true

  try {
    await userApi.updatePassword({
      current_password: passwordForm.current_password,
      password: passwordForm.password,
      password_confirmation: passwordForm.password_confirmation,
    })
    toastStore.success('Mot de passe modifié avec succès.')
    passwordForm.current_password = ''
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
  } catch (err: any) {
    if (err.response?.status === 422 && err.response.data?.errors) {
      passwordErrors.value = err.response.data.errors
    } else {
      toastStore.error(err.response?.data?.message || 'Erreur lors de la modification.')
    }
  } finally {
    isSavingPassword.value = false
  }
}

const handleStartEnableTwoFactor = async () => {
  isEnablingTwoFactor.value = true
  try {
    await authApi.enableTwoFactor()
    const [qrRes, keyRes] = await Promise.all([
      authApi.getTwoFactorQrCode(),
      authApi.getTwoFactorSecretKey(),
    ])
    qrCodeSvg.value = qrRes.svg
    secretKey.value = keyRes.secretKey
    toastStore.info('Scannez le QR Code avec votre application d’authentification.')
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Impossible d’activer la 2FA.')
  } finally {
    isEnablingTwoFactor.value = false
  }
}

const handleConfirmTwoFactor = async () => {
  if (!confirmationCode.value) return
  isConfirmingTwoFactor.value = true

  try {
    await authApi.confirmTwoFactor(confirmationCode.value)
    await authStore.fetchUser()
    const codes = await authApi.getTwoFactorRecoveryCodes()
    recoveryCodes.value = codes
    qrCodeSvg.value = null
    secretKey.value = null
    confirmationCode.value = ''
    toastStore.success('Double authentification activée avec succès !')
  } catch (err: any) {
    toastStore.error('Code de validation incorrect. Veuillez vérifier.')
  } finally {
    isConfirmingTwoFactor.value = false
  }
}

const handleDisableTwoFactor = async () => {
  if (!confirm('Êtes-vous sûr de vouloir désactiver la double authentification ?')) return
  isDisablingTwoFactor.value = true

  try {
    await authApi.disableTwoFactor()
    await authStore.fetchUser()
    recoveryCodes.value = []
    toastStore.info('La double authentification a été désactivée.')
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || 'Erreur lors de la désactivation.')
  } finally {
    isDisablingTwoFactor.value = false
  }
}

const handleViewRecoveryCodes = async () => {
  try {
    const codes = await authApi.getTwoFactorRecoveryCodes()
    recoveryCodes.value = codes
  } catch (err: any) {
    toastStore.error('Impossible de charger les codes de secours.')
  }
}

const handleRegenerateRecoveryCodes = async () => {
  if (!confirm('Régénérer de nouveaux codes invalidera les précédents. Continuer ?')) return
  try {
    const codes = await authApi.regenerateTwoFactorRecoveryCodes()
    recoveryCodes.value = codes
    toastStore.success('Nouveaux codes de secours générés.')
  } catch (err: any) {
    toastStore.error('Erreur lors de la génération.')
  }
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(recoveryCodes.value.join('\n'))
  copiedCodes.value = true
  toastStore.success('Codes copiés dans le presse-papier.')
  setTimeout(() => (copiedCodes.value = false), 2500)
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
        Sécurité & Authentification
      </h1>
      <p class="text-sm text-text-secondary mt-1">
        Configurez votre mot de passe et l'authentification à double facteur (2FA)
      </p>
    </div>

    <!-- Double Authentification (2FA) -->
    <div class="bg-surface border border-border rounded-xl p-6">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-text-primary uppercase tracking-wider">
              Double facteur (TOTP)
            </h2>
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
          <p class="text-xs text-text-secondary mt-1">
            Ajoute une seconde étape de vérification lors de la connexion pour sécuriser votre compte.
          </p>
        </div>
      </div>

      <!-- Cas 1 : 2FA Désactivée et non initiée -->
      <div v-if="!authStore.user?.two_factor_enabled && !qrCodeSvg" class="pt-2">
        <button
          @click="handleStartEnableTwoFactor"
          :disabled="isEnablingTwoFactor"
          class="px-4 py-2 rounded-lg bg-primary text-primary-content text-xs font-bold hover:bg-primary-hover flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Loader2 v-if="isEnablingTwoFactor" class="w-3.5 h-3.5 animate-spin" />
          <ShieldCheck v-else class="w-3.5 h-3.5" />
          <span>Activer la double authentification</span>
        </button>
      </div>

      <!-- Cas 2 : En cours d'activation (Affichage QR Code SVG) -->
      <div v-else-if="qrCodeSvg" class="mt-4 p-5 rounded-lg bg-background border border-border space-y-4">
        <h3 class="text-sm font-bold text-text-primary">Étape d'activation</h3>
        <p class="text-xs text-text-secondary">
          1. Scannez ce code QR avec votre application (Google Authenticator, Authy, 1Password) :
        </p>

        <div class="flex justify-center p-4 bg-white rounded-lg w-fit mx-auto border border-border" v-html="qrCodeSvg"></div>

        <div v-if="secretKey" class="text-center text-xs">
          <span class="text-text-muted">Clé manuelle :</span>
          <code class="font-mono text-primary font-bold ml-1.5">{{ secretKey }}</code>
        </div>

        <p class="text-xs text-text-secondary">
          2. Saisissez le code à 6 chiffres pour valider :
        </p>

        <div class="flex gap-2 max-w-xs">
          <input
            v-model="confirmationCode"
            type="text"
            maxlength="6"
            placeholder="123456"
            class="flex-1 px-3 py-2 rounded-lg bg-surface border border-border text-center font-mono text-base font-bold text-text-primary focus:border-primary"
          />
          <button
            @click="handleConfirmTwoFactor"
            :disabled="isConfirmingTwoFactor || confirmationCode.length < 6"
            class="px-4 py-2 rounded-lg bg-primary text-primary-content font-bold text-xs hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
          >
            <Loader2 v-if="isConfirmingTwoFactor" class="w-3.5 h-3.5 animate-spin" />
            <span v-else>Valider</span>
          </button>
        </div>
      </div>

      <!-- Cas 3 : 2FA déjà activée -->
      <div v-else class="pt-2 space-y-4">
        <div class="flex flex-wrap gap-2">
          <button
            @click="handleViewRecoveryCodes"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-text-primary hover:bg-surface-hover cursor-pointer"
          >
            Afficher les codes de secours
          </button>
          <button
            @click="handleRegenerateRecoveryCodes"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Régénérer</span>
          </button>
          <button
            @click="handleDisableTwoFactor"
            :disabled="isDisablingTwoFactor"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-danger hover:bg-danger-bg border border-danger-border/40 cursor-pointer"
          >
            Désactiver la 2FA
          </button>
        </div>

        <!-- Affichage des codes de secours -->
        <div v-if="recoveryCodes.length > 0" class="p-4 rounded-lg bg-background border border-border mt-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-text-primary uppercase tracking-wider">
              Codes de secours d'urgence
            </span>
            <button
              @click="copyToClipboard"
              class="flex items-center gap-1 text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              <Check v-if="copiedCodes" class="w-3.5 h-3.5 text-success" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copiedCodes ? 'Copié !' : 'Copier tout' }}</span>
            </button>
          </div>
          <p class="text-xs text-text-secondary mb-3">
            Conservez ces codes dans un endroit sûr. Chacun ne peut être utilisé qu'une seule fois.
          </p>
          <div class="grid grid-cols-2 gap-2 font-mono text-xs text-text-primary bg-surface p-3 rounded border border-border">
            <div v-for="c in recoveryCodes" :key="c">{{ c }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modifier le mot de passe -->
    <div class="bg-surface border border-border rounded-xl p-6">
      <h2 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
        Changer de mot de passe
      </h2>

      <form @submit.prevent="handleUpdatePassword" class="space-y-4">
        <div>
          <label for="current_password" class="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Mot de passe actuel
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="current_password"
              v-model="passwordForm.current_password"
              type="password"
              required
              class="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm transition-colors focus:border-primary"
            />
          </div>
          <p v-if="passwordErrors.current_password" class="mt-1 text-xs text-danger">
            {{ passwordErrors.current_password[0] }}
          </p>
        </div>

        <div>
          <label for="new_password" class="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Nouveau mot de passe
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="new_password"
              v-model="passwordForm.password"
              type="password"
              required
              class="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm transition-colors focus:border-primary"
            />
          </div>
          <p v-if="passwordErrors.password" class="mt-1 text-xs text-danger">
            {{ passwordErrors.password[0] }}
          </p>
        </div>

        <div>
          <label for="new_password_confirmation" class="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Confirmer le nouveau mot de passe
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="new_password_confirmation"
              v-model="passwordForm.password_confirmation"
              type="password"
              required
              class="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm transition-colors focus:border-primary"
            />
          </div>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSavingPassword"
            class="px-5 py-2.5 rounded-lg bg-primary text-primary-content font-bold text-sm hover:bg-primary-hover active:scale-[0.99] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Loader2 v-if="isSavingPassword" class="w-4 h-4 animate-spin" />
            <KeyRound v-else class="w-4 h-4" />
            <span>Mettre à jour le mot de passe</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
