<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { userApi } from '@/api/user.api'
import CountryPhoneInput from '@/components/common/CountryPhoneInput.vue'
import { countryCodes } from '@/constants/countryCodes'
import { Camera, Trash2, Loader2, Save, User, Mail } from 'lucide-vue-next'

const authStore = useAuthStore()
const toastStore = useToastStore()

const form = reactive({
  name: '',
  email: '',
  birth_date: '',
  birth_place: '',
})

const selectedDialCode = ref('+225')
const phoneNumber = ref('')

const isSavingProfile = ref(false)
const isUploadingAvatar = ref(false)
const isDeletingAvatar = ref(false)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const errors = ref<Record<string, string[]>>({})

onMounted(() => {
  if (authStore.user) {
    form.name = authStore.user.name
    form.email = authStore.user.email
    form.birth_date = authStore.user.birth_date || ''
    form.birth_place = authStore.user.birth_place || ''

    if (authStore.user.phone) {
      const sortedCodes = [...countryCodes].sort((a, b) => b.dialCode.length - a.dialCode.length)
      const matched = sortedCodes.find((c) => authStore.user!.phone!.startsWith(c.dialCode))
      if (matched) {
        selectedDialCode.value = matched.dialCode
        phoneNumber.value = authStore.user.phone.slice(matched.dialCode.length)
      } else {
        selectedDialCode.value = '+225'
        phoneNumber.value = authStore.user.phone
      }
    }
  }
})

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (file.size > 2 * 1024 * 1024) {
      toastStore.error("L'image ne doit pas dépasser 2 Mo.")
      return
    }
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

const handleUploadAvatar = async () => {
  if (!avatarFile.value) return
  isUploadingAvatar.value = true
  try {
    const updatedUser = await userApi.uploadAvatar(avatarFile.value)
    authStore.setAuthData(null, updatedUser)
    avatarFile.value = null
    avatarPreview.value = null
    toastStore.success('Avatar mis à jour avec succès.')
  } catch (err: unknown) {
    const message = axios.isAxiosError(err) ? err.response?.data?.message : null
    toastStore.error(message || "Échec de l'upload de l'avatar.")
  } finally {
    isUploadingAvatar.value = false
  }
}

const handleDeleteAvatar = async () => {
  if (!confirm('Voulez-vous réinitialiser votre avatar par défaut ?')) return
  isDeletingAvatar.value = true
  try {
    const updatedUser = await userApi.deleteAvatar()
    authStore.setAuthData(null, updatedUser)
    avatarFile.value = null
    avatarPreview.value = null
    toastStore.success('Avatar réinitialisé.')
  } catch (err: unknown) {
    const message = axios.isAxiosError(err) ? err.response?.data?.message : null
    toastStore.error(message || 'Impossible de supprimer cet avatar.')
  } finally {
    isDeletingAvatar.value = false
  }
}

const handleSaveProfile = async () => {
  errors.value = {}
  isSavingProfile.value = true

  const cleanedPhone = phoneNumber.value.trim()
  const fullPhone = cleanedPhone
    ? `${selectedDialCode.value}${cleanedPhone.replace(/\s+/g, '')}`
    : null

  try {
    await userApi.updateProfile({
      name: form.name,
      email: form.email,
      phone: fullPhone,
      birth_date: form.birth_date ? form.birth_date : null,
      birth_place: form.birth_place ? form.birth_place : null,
    })

    await authStore.fetchUser()
    toastStore.success('Profil mis à jour avec succès.')
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 422 && err.response.data?.errors) {
      errors.value = err.response.data.errors
    } else {
      toastStore.error('Erreur lors de la mise à jour.')
    }
  } finally {
    isSavingProfile.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
        Profil personnel
      </h1>
      <p class="text-sm text-text-secondary mt-1">
        Gérez vos informations de compte et votre avatar public
      </p>
    </div>

    <!-- Section Avatar -->
    <div class="bg-surface border border-border rounded-xl p-6">
      <h2 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
        Photo de profil
      </h2>

      <div class="flex flex-col sm:flex-row items-center gap-6">
        <div class="relative">
          <img
            :src="avatarPreview || authStore.user?.avatar_url"
            alt="Avatar"
            class="w-24 h-24 rounded-full border-2 border-border object-cover bg-surface-elevated"
          />
          <label
            for="avatar-input"
            class="absolute bottom-0 right-0 p-2 bg-primary text-primary-content rounded-full shadow cursor-pointer hover:bg-primary-hover transition-transform active:scale-95"
            title="Changer la photo"
          >
            <Camera class="w-4 h-4" />
            <input
              id="avatar-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              class="hidden"
              @change="handleFileChange"
            />
          </label>
        </div>

        <div class="flex-1 flex flex-col gap-2 text-center sm:text-left">
          <p class="text-xs text-text-secondary">
            Formats acceptés : JPG, PNG ou WEBP. Poids maximum autorisé : 2 Mo.
          </p>

          <div class="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
            <button
              v-if="avatarFile"
              @click="handleUploadAvatar"
              :disabled="isUploadingAvatar"
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-content hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Loader2 v-if="isUploadingAvatar" class="w-3.5 h-3.5 animate-spin" />
              <span>Enregistrer la nouvelle photo</span>
            </button>

            <button
              @click="handleDeleteAvatar"
              :disabled="isDeletingAvatar"
              class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-danger hover:bg-danger-bg border border-border hover:border-danger-border transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Supprimer la photo actuelle</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Informations personnelles -->
    <div class="bg-surface border border-border rounded-xl p-6">
      <h2 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
        Coordonnées
      </h2>

      <form @submit.prevent="handleSaveProfile" class="space-y-4">
        <!-- Nom -->
        <div>
          <label for="name" class="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Nom complet
          </label>
          <div class="relative">
            <User class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm transition-colors focus:border-primary"
            />
          </div>
          <p v-if="errors.name" class="mt-1 text-xs text-danger">{{ errors.name[0] }}</p>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Adresse e-mail
          </label>
          <div class="relative">
            <Mail class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm transition-colors focus:border-primary"
            />
          </div>
          <p v-if="errors.email" class="mt-1 text-xs text-danger">{{ errors.email[0] }}</p>
        </div>

        <!-- Téléphone avec drapeaux et recherche -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Numéro de téléphone
          </label>
          <CountryPhoneInput
            v-model="phoneNumber"
            v-model:dialCode="selectedDialCode"
            placeholder="07 07 07 07 07"
            :disabled="isSavingProfile"
          />
          <p v-if="errors.phone" class="mt-1 text-xs text-danger">{{ errors.phone[0] }}</p>
        </div>

        <!-- Date de naissance -->
        <div>
          <label for="birth_date" class="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Date de naissance
          </label>
          <input
            id="birth_date"
            v-model="form.birth_date"
            type="date"
            class="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm transition-colors focus:border-primary"
          />
          <p v-if="errors.birth_date" class="mt-1 text-xs text-danger">{{ errors.birth_date[0] }}</p>
        </div>

        <!-- Lieu de naissance -->
        <div>
          <label for="birth_place" class="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Lieu de naissance
          </label>
          <input
            id="birth_place"
            v-model="form.birth_place"
            type="text"
            placeholder="Ex. Abidjan, Côte d'Ivoire"
            class="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-text-primary text-sm transition-colors focus:border-primary"
          />
          <p v-if="errors.birth_place" class="mt-1 text-xs text-danger">{{ errors.birth_place[0] }}</p>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSavingProfile"
            class="px-5 py-2.5 rounded-lg bg-primary text-primary-content font-bold text-sm hover:bg-primary-hover active:scale-[0.99] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Loader2 v-if="isSavingProfile" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
