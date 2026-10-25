<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { countryCodes } from '@/constants/countryCodes'
import TipTokLogo from '@/components/common/TipTokLogo.vue'
import {
  HelpCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronDown,
  Loader2,
  MapPin,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

// Mode d'inscription : 'email' ou 'phone'
const signupMode = ref<'email' | 'phone'>('email')

// Date de naissance
const birthMonth = ref('')
const birthDay = ref('')
const birthYear = ref('')

const months = [
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
]

const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 90 }, (_, i) => String(currentYear - 13 - i))

// Indicatif pays sélectionné (Côte d'Ivoire par défaut, ou premier de la liste)
const selectedDialCode = ref('+225')

// Formulaire complet
const form = reactive({
  name: '',
  email: '',
  phoneNumber: '',
  birth_place: '',
  password: '',
  password_confirmation: '',
  optInNewsletter: true,
})

const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const errors = ref<Record<string, string[]>>({})
const generalError = ref<string | null>(null)

// Validation
const isFormValid = computed(() => {
  const hasBasicInfo =
    form.name.trim().length > 0 &&
    form.password.length >= 8 &&
    form.password === form.password_confirmation

  if (signupMode.value === 'email') {
    return form.email.includes('@') && hasBasicInfo
  } else {
    return form.phoneNumber.trim().length >= 6 && form.email.includes('@') && hasBasicInfo
  }
})

const handleSubmit = async () => {
  errors.value = {}
  generalError.value = null

  // Formatage date de naissance (YYYY-MM-DD)
  let formattedBirthDate: string | undefined = undefined
  if (birthYear.value && birthMonth.value && birthDay.value) {
    formattedBirthDate = `${birthYear.value}-${birthMonth.value}-${birthDay.value}`
  }

  // Formatage téléphone international
  const fullPhone = form.phoneNumber
    ? `${selectedDialCode.value}${form.phoneNumber.replace(/^0+/, '')}`
    : undefined

  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      phone: fullPhone,
      birth_date: formattedBirthDate,
      birth_place: form.birth_place.trim() || undefined,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })

    toastStore.success('Compte TipTok créé avec succès ! Bienvenue.')
    router.push('/dashboard')
  } catch (err: any) {
    if (err.response?.status === 422 && err.response.data?.errors) {
      errors.value = err.response.data.errors
    } else if (err.response?.data?.message) {
      generalError.value = err.response.data.message
    } else {
      generalError.value = 'Erreur lors de la création du compte. Vérifiez les informations saisies.'
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-text-primary">
    <!-- Header style TikTok (Logo avec icône à gauche et titre à droite) -->
    <header class="w-full h-16 border-b border-border px-6 sm:px-10 flex items-center justify-between select-none">
      <RouterLink to="/" class="flex items-center hover:opacity-90 transition-opacity">
        <TipTokLogo size="sm" />
      </RouterLink>

      <a
        href="#"
        class="text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
      >
        <HelpCircle class="w-4 h-4" />
        <span>Commentaires et assistance</span>
      </a>
    </header>

    <!-- Contenu Principal centré style TikTok -->
    <main class="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div class="w-full max-w-[420px]">
        <h1 class="text-3xl font-extrabold text-center text-text-primary tracking-tight mb-8">
          S'inscrire
        </h1>

        <!-- Alerte erreur globale -->
        <div
          v-if="generalError"
          class="mb-6 p-3.5 rounded-lg bg-danger-bg border border-danger-border text-danger text-xs font-medium"
        >
          {{ generalError }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4.5">
          <!-- 1. Date de naissance (comme sur TikTok) -->
          <div>
            <label class="block text-sm font-bold text-text-primary mb-2">
              Quelle est ta date de naissance ?
            </label>
            <div class="grid grid-cols-3 gap-2">
              <!-- Mois -->
              <div class="relative">
                <select
                  v-model="birthMonth"
                  class="w-full appearance-none px-3.5 py-3 rounded-lg bg-surface border border-border text-text-primary text-sm focus:border-primary pr-8 cursor-pointer"
                >
                  <option value="" disabled selected>Mois</option>
                  <option v-for="m in months" :key="m.value" :value="m.value">
                    {{ m.label }}
                  </option>
                </select>
                <ChevronDown class="w-4 h-4 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <!-- Jour -->
              <div class="relative">
                <select
                  v-model="birthDay"
                  class="w-full appearance-none px-3.5 py-3 rounded-lg bg-surface border border-border text-text-primary text-sm focus:border-primary pr-8 cursor-pointer"
                >
                  <option value="" disabled selected>Jour</option>
                  <option v-for="d in days" :key="d" :value="d">
                    {{ d }}
                  </option>
                </select>
                <ChevronDown class="w-4 h-4 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <!-- Année -->
              <div class="relative">
                <select
                  v-model="birthYear"
                  class="w-full appearance-none px-3.5 py-3 rounded-lg bg-surface border border-border text-text-primary text-sm focus:border-primary pr-8 cursor-pointer"
                >
                  <option value="" disabled selected>Année</option>
                  <option v-for="y in years" :key="y" :value="y">
                    {{ y }}
                  </option>
                </select>
                <ChevronDown class="w-4 h-4 text-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <p class="text-[11px] text-text-muted mt-1.5">
              Ta date de naissance ne sera pas affichée publiquement.
            </p>
          </div>

          <!-- 2. Lieu de naissance -->
          <div>
            <label class="block text-sm font-bold text-text-primary mb-2">
              Lieu de naissance <span class="text-xs font-normal text-text-muted">(Ville / Pays)</span>
            </label>
            <div class="relative">
              <MapPin class="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                v-model="form.birth_place"
                type="text"
                placeholder="Ex. Abidjan, Côte d'Ivoire"
                class="w-full pl-9 pr-3.5 py-3 rounded-lg bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:border-primary transition-colors"
              />
            </div>
            <p v-if="errors.birth_place" class="text-xs text-danger mt-1">
              {{ errors.birth_place[0] }}
            </p>
          </div>

          <!-- 3. Bascule E-mail / Téléphone (avec la liste complète countryCodes) -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-bold text-text-primary">
                {{ signupMode === 'email' ? 'E-mail' : 'Téléphone' }}
              </span>
              <button
                type="button"
                @click="signupMode = signupMode === 'email' ? 'phone' : 'email'"
                class="text-xs font-medium text-text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                {{ signupMode === 'email' ? 'Inscription par téléphone' : 'Inscription par e-mail' }}
              </button>
            </div>

            <!-- Mode Téléphone : Sélecteur des 28 pays + Numéro -->
            <div v-if="signupMode === 'phone'" class="space-y-2">
              <div class="flex gap-2">
                <div class="relative w-40">
                  <select
                    v-model="selectedDialCode"
                    class="w-full appearance-none px-3 py-3 rounded-lg bg-surface border border-border text-text-primary text-xs font-semibold focus:border-primary pr-7 cursor-pointer"
                  >
                    <option
                      v-for="c in countryCodes"
                      :key="c.code"
                      :value="c.dialCode"
                    >
                      {{ c.flag }} {{ c.code }} ({{ c.dialCode }})
                    </option>
                  </select>
                  <ChevronDown class="w-4 h-4 text-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <input
                  v-model="form.phoneNumber"
                  type="tel"
                  placeholder="Numéro de téléphone"
                  class="flex-1 px-3.5 py-3 rounded-lg bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:border-primary transition-colors"
                />
              </div>
              <p v-if="errors.phone" class="text-xs text-danger">
                {{ errors.phone[0] }}
              </p>

              <!-- Email requis pour le compte -->
              <div>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="Adresse e-mail (pour sécuriser le compte)"
                  class="w-full px-3.5 py-3 rounded-lg bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:border-primary transition-colors"
                />
                <p v-if="errors.email" class="text-xs text-danger mt-1">
                  {{ errors.email[0] }}
                </p>
              </div>
            </div>

            <!-- Mode E-mail direct -->
            <div v-else>
              <input
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                placeholder="Adresse e-mail"
                class="w-full px-3.5 py-3 rounded-lg bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:border-primary transition-colors"
              />
              <p v-if="errors.email" class="text-xs text-danger mt-1">
                {{ errors.email[0] }}
              </p>
            </div>
          </div>

          <!-- 4. Nom ou pseudo public -->
          <div>
            <label class="block text-sm font-bold text-text-primary mb-2">
              Nom ou pseudo public
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              autocomplete="name"
              placeholder="Ton pseudo ou nom complet"
              class="w-full px-3.5 py-3 rounded-lg bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:border-primary transition-colors"
            />
            <p v-if="errors.name" class="text-xs text-danger mt-1">
              {{ errors.name[0] }}
            </p>
          </div>

          <!-- 5. Mot de passe avec toggle Afficher/Masquer -->
          <div>
            <label class="block text-sm font-bold text-text-primary mb-2">
              Mot de passe
            </label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                placeholder="Mot de passe (8 caractères min.)"
                class="w-full px-3.5 py-3 pr-10 rounded-lg bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:border-primary transition-colors"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
                title="Afficher/masquer le mot de passe"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-danger mt-1">
              {{ errors.password[0] }}
            </p>
          </div>

          <!-- 6. Confirmation du mot de passe -->
          <div>
            <div class="relative">
              <input
                v-model="form.password_confirmation"
                :type="showPasswordConfirm ? 'text' : 'password'"
                required
                autocomplete="new-password"
                placeholder="Confirme ton mot de passe"
                class="w-full px-3.5 py-3 pr-10 rounded-lg bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:border-primary transition-colors"
              />
              <button
                type="button"
                @click="showPasswordConfirm = !showPasswordConfirm"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 cursor-pointer"
              >
                <EyeOff v-if="showPasswordConfirm" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- 7. Case à cocher Newsletter / Actualités -->
          <div class="flex items-start gap-2.5 pt-1">
            <input
              id="optIn"
              v-model="form.optInNewsletter"
              type="checkbox"
              class="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary bg-surface cursor-pointer"
            />
            <label for="optIn" class="text-[11px] text-text-secondary leading-normal cursor-pointer select-none">
              Reçois du contenu tendance, des actualités et des recommandations de compte par e-mail.
            </label>
          </div>

          <!-- 8. Bouton S'inscrire -->
          <button
            type="submit"
            :disabled="authStore.isLoading || !isFormValid"
            class="w-full py-3 px-4 rounded-lg font-bold text-sm text-primary-content bg-primary hover:bg-primary-hover active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Loader2 v-if="authStore.isLoading" class="w-4 h-4 animate-spin" />
            <span v-else>S'inscrire</span>
          </button>

          <!-- Lien Retour -->
          <div class="text-center pt-2">
            <RouterLink
              to="/login"
              class="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronLeft class="w-3.5 h-3.5" />
              <span>Retour</span>
            </RouterLink>
          </div>
        </form>
      </div>
    </main>

    <!-- Pied de page fixe style TikTok -->
    <footer class="w-full border-t border-border bg-surface py-5 px-4 text-center select-none">
      <p class="text-sm text-text-primary">
        Tu as déjà un compte ?
        <RouterLink
          to="/login"
          class="font-bold text-primary hover:underline ml-1.5 transition-colors"
        >
          Se connecter
        </RouterLink>
      </p>
    </footer>
  </div>
</template>
