<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { userApi } from '@/api/user.api'
import { authApi } from '@/api/auth.api'
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Loader2,
  Copy,
  RefreshCw,
  Check,
  AlertTriangle,
  Trash2,
  X,
  QrCode,
} from 'lucide-vue-next'

const router = useRouter()
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

// Modals State
const showPasswordConfirmModal = ref(false)
const confirmPasswordInput = ref('')
const passwordConfirmError = ref('')
const isConfirmingPassword = ref(false)
const pendingAction = ref<'enable' | 'disable' | 'show-codes' | null>(null)

// 2FA Setup
const show2FAModal = ref(false)
const showRecoveryCodesModal = ref(false)
const isEnablingTwoFactor = ref(false)
const isConfirmingTwoFactor = ref(false)
const isDisablingTwoFactor = ref(false)
const qrCodeSvg = ref<string | null>(null)
const secretKey = ref<string | null>(null)
const confirmationCode = ref('')
const confirmationError = ref('')
const recoveryCodes = ref<string[]>([])
const copiedCodes = ref(false)
const copiedSecretKey = ref(false)

// Supprimer le compte
const showDeleteAccountModal = ref(false)
const deleteAccountPassword = ref('')
const deleteAccountError = ref('')
const isDeletingAccount = ref(false)

const sanitizedQrCodeSvg = computed(() => {
  if (!qrCodeSvg.value) return ''
  const trimmed = qrCodeSvg.value.trim()
  if (!trimmed.startsWith('<svg') || /<script|onload|onerror|javascript:/i.test(trimmed)) {
    return ''
  }
  return trimmed
})

const requestAction = (action: 'enable' | 'disable' | 'show-codes') => {
  pendingAction.value = action
  confirmPasswordInput.value = ''
  passwordConfirmError.value = ''
  showPasswordConfirmModal.value = true
}

const handlePasswordConfirm = async () => {
  if (!confirmPasswordInput.value) return
  isConfirmingPassword.value = true
  passwordConfirmError.value = ''

  try {
    await authApi.confirmPassword(confirmPasswordInput.value)
    showPasswordConfirmModal.value = false
    const action = pendingAction.value
    pendingAction.value = null
    confirmPasswordInput.value = ''

    if (action === 'enable') {
      await handleStartEnableTwoFactor()
    } else if (action === 'disable') {
      await handleDisableTwoFactor()
    } else if (action === 'show-codes') {
      await handleViewRecoveryCodes()
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      passwordConfirmError.value =
        err.response?.data?.errors?.password?.[0] ||
        err.response?.data?.message ||
        'Mot de passe incorrect.'
    } else {
      passwordConfirmError.value = 'Erreur lors de la confirmation du mot de passe.'
    }
  } finally {
    isConfirmingPassword.value = false
  }
}

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
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 422 && err.response.data?.errors) {
      passwordErrors.value = err.response.data.errors
    } else {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null
      toastStore.error(message || 'Erreur lors de la modification.')
    }
  } finally {
    isSavingPassword.value = false
  }
}

const handleStartEnableTwoFactor = async () => {
  isEnablingTwoFactor.value = true
  confirmationError.value = ''
  try {
    await authApi.enableTwoFactor()
    const [qrRes, keyRes] = await Promise.all([
      authApi.getTwoFactorQrCode(),
      authApi.getTwoFactorSecretKey(),
    ])
    qrCodeSvg.value = qrRes.svg
    secretKey.value = keyRes.secretKey
    confirmationCode.value = ''
    show2FAModal.value = true
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 423) {
      requestAction('enable')
    } else {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null
      toastStore.error(message || "Impossible d'initier la double authentification.")
    }
  } finally {
    isEnablingTwoFactor.value = false
  }
}

const handleConfirmTwoFactor = async () => {
  if (!confirmationCode.value || confirmationCode.value.length < 6) return
  isConfirmingTwoFactor.value = true
  confirmationError.value = ''

  try {
    await authApi.confirmTwoFactor(confirmationCode.value)
    await authStore.fetchUser()
    const codes = await authApi.getTwoFactorRecoveryCodes()
    recoveryCodes.value = codes
    show2FAModal.value = false
    showRecoveryCodesModal.value = true
    confirmationCode.value = ''
    toastStore.success('Double authentification activée avec succès !')
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      confirmationError.value =
        err.response?.data?.errors?.code?.[0] ||
        err.response?.data?.message ||
        'Code à 6 chiffres incorrect.'
    } else {
      confirmationError.value = 'Code invalide ou expiré.'
    }
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
    qrCodeSvg.value = null
    secretKey.value = null
    toastStore.info('La double authentification a été désactivée.')
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 423) {
      requestAction('disable')
    } else {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : null
      toastStore.error(message || 'Erreur lors de la désactivation.')
    }
  } finally {
    isDisablingTwoFactor.value = false
  }
}

const handleViewRecoveryCodes = async () => {
  try {
    const codes = await authApi.getTwoFactorRecoveryCodes()
    recoveryCodes.value = codes
    showRecoveryCodesModal.value = true
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 423) {
      requestAction('show-codes')
    } else {
      toastStore.error('Impossible de charger les codes de secours.')
    }
  }
}

const handleRegenerateRecoveryCodes = async () => {
  if (!confirm('Régénérer de nouveaux codes invalidera les précédents. Continuer ?')) return
  try {
    const codes = await authApi.regenerateTwoFactorRecoveryCodes()
    recoveryCodes.value = codes
    showRecoveryCodesModal.value = true
    toastStore.success('Nouveaux codes de secours générés.')
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 423) {
      requestAction('show-codes')
    } else {
      toastStore.error('Erreur lors de la régénération.')
    }
  }
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(recoveryCodes.value.join('\n'))
  copiedCodes.value = true
  toastStore.success('Codes copiés dans le presse-papier.')
  setTimeout(() => (copiedCodes.value = false), 2500)
}

const copySecretKey = () => {
  if (!secretKey.value) return
  navigator.clipboard.writeText(secretKey.value)
  copiedSecretKey.value = true
  toastStore.success('Clé secrète copiée !')
  setTimeout(() => (copiedSecretKey.value = false), 2500)
}

// Supprimer le compte
const openDeleteAccountModal = () => {
  deleteAccountPassword.value = ''
  deleteAccountError.value = ''
  showDeleteAccountModal.value = true
}

const handleDeleteAccount = async () => {
  if (!deleteAccountPassword.value) return
  isDeletingAccount.value = true
  deleteAccountError.value = ''

  try {
    await userApi.deleteAccount(deleteAccountPassword.value)
    toastStore.success('Votre compte et vos données ont été définitivement supprimés.')
    showDeleteAccountModal.value = false
    try {
      await authStore.logout()
    } catch {
      // Ignorer si déjà détruit
    }
    router.push('/login')
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      deleteAccountError.value =
        err.response?.data?.errors?.password?.[0] ||
        err.response?.data?.message ||
        'Erreur lors de la suppression du compte.'
    } else {
      deleteAccountError.value = 'Une erreur est survenue lors de la suppression.'
    }
  } finally {
    isDeletingAccount.value = false
  }
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
    <div class="bg-surface border border-border rounded-xl p-6 shadow-sm">
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

      <!-- Cas 1 : 2FA Désactivée -->
      <div v-if="!authStore.user?.two_factor_enabled" class="pt-2">
        <button
          @click="handleStartEnableTwoFactor"
          :disabled="isEnablingTwoFactor"
          class="px-4 py-2.5 rounded-lg bg-primary text-primary-content text-xs font-bold hover:bg-primary-hover flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
        >
          <Loader2 v-if="isEnablingTwoFactor" class="w-4 h-4 animate-spin" />
          <ShieldCheck v-else class="w-4 h-4" />
          <span>Activer la double authentification</span>
        </button>
      </div>

      <!-- Cas 2 : 2FA déjà activée -->
      <div v-else class="pt-2 space-y-4">
        <div class="flex flex-wrap gap-2.5">
          <button
            @click="handleViewRecoveryCodes"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface border border-border text-text-primary hover:bg-surface-hover cursor-pointer transition-colors"
          >
            Afficher les codes de secours
          </button>
          <button
            @click="handleRegenerateRecoveryCodes"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Régénérer</span>
          </button>
          <button
            @click="handleDisableTwoFactor"
            :disabled="isDisablingTwoFactor"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold text-danger hover:bg-danger-bg border border-danger-border/40 cursor-pointer transition-colors"
          >
            Désactiver la 2FA
          </button>
        </div>
      </div>
    </div>

    <!-- Modifier le mot de passe -->
    <div class="bg-surface border border-border rounded-xl p-6 shadow-sm">
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
            class="px-5 py-2.5 rounded-lg bg-primary text-primary-content font-bold text-sm hover:bg-primary-hover active:scale-[0.99] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Loader2 v-if="isSavingPassword" class="w-4 h-4 animate-spin" />
            <KeyRound v-else class="w-4 h-4" />
            <span>Mettre à jour le mot de passe</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Zone de Danger : Suppression du compte -->
    <div class="bg-surface border border-danger-border/40 rounded-xl p-6 shadow-sm space-y-4">
      <div class="flex items-center gap-2">
        <AlertTriangle class="w-5 h-5 text-danger" />
        <h2 class="text-sm font-bold text-danger uppercase tracking-wider">
          Zone de Danger
        </h2>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div>
          <p class="text-sm font-bold text-text-primary">Supprimer définitivement mon compte</p>
          <p class="text-xs text-text-secondary mt-0.5">
            Une fois supprimé, toutes vos ressources, vos astuces et vos données seront effacées de manière irréversible.
          </p>
        </div>

        <button
          @click="openDeleteAccountModal"
          class="shrink-0 px-4 py-2.5 rounded-lg bg-danger-bg text-danger border border-danger-border font-bold text-xs hover:bg-danger hover:text-white transition-all flex items-center gap-2 cursor-pointer"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Supprimer le compte</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================
       MODAL 1 : Confirmation du mot de passe (Fortify 423)
       ======================================================== -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="showPasswordConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
              <Lock class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-text-primary">Confirmation de sécurité</h3>
              <p class="text-xs text-text-muted mt-0.5">Veuillez saisir votre mot de passe pour continuer.</p>
            </div>
          </div>
          <button @click="showPasswordConfirmModal = false" class="text-text-muted hover:text-text-primary cursor-pointer p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-1.5 pt-2">
          <label class="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Mot de passe actuel
          </label>
          <input
            v-model="confirmPasswordInput"
            type="password"
            placeholder="••••••••"
            class="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm focus:border-primary"
            @keyup.enter="handlePasswordConfirm"
            autofocus
          />
          <p v-if="passwordConfirmError" class="text-xs text-danger font-medium mt-1">
            {{ passwordConfirmError }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            @click="showPasswordConfirmModal = false"
            class="px-4 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover cursor-pointer"
          >
            Annuler
          </button>
          <button
            @click="handlePasswordConfirm"
            :disabled="isConfirmingPassword || !confirmPasswordInput"
            class="px-5 py-2 rounded-lg bg-primary text-primary-content text-xs font-bold hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Loader2 v-if="isConfirmingPassword" class="w-3.5 h-3.5 animate-spin" />
            <span>Confirmer</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ========================================================
       MODAL 2 : Activation 2FA avec QR Code SVG (Comme Obryl)
       ======================================================== -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="show2FAModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div class="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
              <QrCode class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-text-primary">Activer la double authentification</h3>
              <p class="text-xs text-text-muted mt-0.5">Scannez ce QR code avec votre application TOTP</p>
            </div>
          </div>
          <button @click="show2FAModal = false" class="text-text-muted hover:text-text-primary cursor-pointer p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Rendu du QR Code SVG centré -->
        <div class="flex justify-center p-4 bg-white rounded-xl border border-border shadow-inner [&>svg]:w-48 [&>svg]:h-48" v-html="sanitizedQrCodeSvg"></div>

        <!-- Clé secrète manuelle -->
        <div v-if="secretKey" class="space-y-1 bg-surface-elevated p-3 rounded-lg border border-border text-center">
          <div class="flex items-center justify-between text-[11px] text-text-muted uppercase font-bold tracking-wider mb-1">
            <span>Clé de configuration manuelle</span>
            <button
              @click="copySecretKey"
              class="text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Check v-if="copiedSecretKey" class="w-3 h-3 text-success" />
              <Copy v-else class="w-3 h-3" />
              <span>{{ copiedSecretKey ? 'Copié' : 'Copier' }}</span>
            </button>
          </div>
          <p class="text-xs font-mono font-bold text-text-primary select-all tracking-wider break-all">
            {{ secretKey }}
          </p>
        </div>

        <!-- Saisie du code à 6 chiffres -->
        <div class="space-y-2 pt-2 border-t border-border">
          <label class="block text-xs font-bold text-text-primary">
            Saisissez le code à 6 chiffres généré par l'application :
          </label>
          <div class="flex gap-2">
            <input
              v-model="confirmationCode"
              type="text"
              maxlength="6"
              placeholder="ex: 123456"
              class="flex-1 px-3.5 py-2.5 rounded-lg bg-background border border-border text-center font-mono text-base font-bold text-text-primary tracking-widest focus:border-primary"
              @keyup.enter="handleConfirmTwoFactor"
            />
            <button
              @click="handleConfirmTwoFactor"
              :disabled="isConfirmingTwoFactor || confirmationCode.length < 6"
              class="px-5 py-2.5 rounded-lg bg-primary text-primary-content text-xs font-bold hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Loader2 v-if="isConfirmingTwoFactor" class="w-3.5 h-3.5 animate-spin" />
              <span>Valider</span>
            </button>
          </div>
          <p v-if="confirmationError" class="text-xs text-danger font-medium mt-1">
            {{ confirmationError }}
          </p>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ========================================================
       MODAL 3 : Codes de Récupération d'Urgence
       ======================================================== -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="showRecoveryCodesModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-success-bg text-success flex items-center justify-center">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-text-primary">Codes de secours d'urgence</h3>
              <p class="text-xs text-text-muted mt-0.5">Conservez ces codes en lieu sûr</p>
            </div>
          </div>
          <button @click="showRecoveryCodesModal = false" class="text-text-muted hover:text-text-primary cursor-pointer p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <p class="text-xs text-text-secondary leading-relaxed">
          Si vous perdez l'accès à votre application d'authentification, ces codes à usage unique sont le seul moyen de récupérer l'accès à votre compte.
        </p>

        <div class="grid grid-cols-2 gap-2 font-mono text-xs text-text-primary bg-background p-3.5 rounded-xl border border-border">
          <div v-for="c in recoveryCodes" :key="c" class="p-1 text-center font-bold">
            {{ c }}
          </div>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-border">
          <button
            @click="copyToClipboard"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-text-primary hover:bg-surface-hover cursor-pointer"
          >
            <Check v-if="copiedCodes" class="w-3.5 h-3.5 text-success" />
            <Copy v-else class="w-3.5 h-3.5" />
            <span>{{ copiedCodes ? 'Codes copiés !' : 'Copier tous les codes' }}</span>
          </button>

          <button
            @click="showRecoveryCodesModal = false"
            class="px-5 py-2 rounded-lg bg-primary text-primary-content text-xs font-bold hover:bg-primary-hover cursor-pointer"
          >
            J'ai bien sauvegardé
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ========================================================
       MODAL 4 : Supprimer définitivement le compte
       ======================================================== -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="showDeleteAccountModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-surface border border-danger-border/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-danger-bg text-danger flex items-center justify-center">
              <Trash2 class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-danger">Supprimer définitivement mon compte</h3>
              <p class="text-xs text-text-muted mt-0.5">Cette opération est irréversible</p>
            </div>
          </div>
          <button @click="showDeleteAccountModal = false" class="text-text-muted hover:text-text-primary cursor-pointer p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-3 bg-danger-bg/50 border border-danger-border/30 rounded-lg text-xs text-danger leading-relaxed">
          Êtes-vous absolument sûr ? Vos astuces de code, vos commentaires, vos likes, vos clés d'API et vos sessions seront définitivement détruits.
        </div>

        <div class="space-y-1.5 pt-1">
          <label class="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Saisissez votre mot de passe pour confirmer
          </label>
          <input
            v-model="deleteAccountPassword"
            type="password"
            placeholder="••••••••"
            class="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm focus:border-danger"
            @keyup.enter="handleDeleteAccount"
            autofocus
          />
          <p v-if="deleteAccountError" class="text-xs text-danger font-medium mt-1">
            {{ deleteAccountError }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            @click="showDeleteAccountModal = false"
            class="px-4 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-hover cursor-pointer"
          >
            Annuler
          </button>
          <button
            @click="handleDeleteAccount"
            :disabled="isDeletingAccount || !deleteAccountPassword"
            class="px-5 py-2 rounded-lg bg-danger text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Loader2 v-if="isDeletingAccount" class="w-3.5 h-3.5 animate-spin" />
            <span>Supprimer définitivement</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
