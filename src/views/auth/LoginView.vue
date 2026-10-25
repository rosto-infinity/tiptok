<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import TipTokLogo from '@/components/common/TipTokLogo.vue'
import {
  HelpCircle,
  Eye,
  EyeOff,
  Loader2,

} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const form = reactive({
  email: '',
  password: '',
})

const showPassword = ref(false)
const errors = ref<Record<string, string[]>>({})
const generalError = ref<string | null>(null)

const isFormValid = computed(() => {
  return form.email.includes('@') && form.password.length >= 6
})

const handleSubmit = async () => {
  errors.value = {}
  generalError.value = null

  try {
    const result = await authStore.login({
      email: form.email,
      password: form.password,
    })

    if (result.twoFactor) {
      toastStore.info('Veuillez entrer votre code de vérification à deux facteurs.')
      router.push('/two-factor-challenge')
      return
    }

    toastStore.success('Connexion réussie.')
    router.push('/dashboard')
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 422 && err.response.data?.errors) {
      errors.value = err.response.data.errors
    } else if (axios.isAxiosError(err) && err.response?.data?.message) {
      generalError.value = err.response.data.message
    } else {
      generalError.value = 'Impossible de se connecter au serveur (port 8006). Vérifiez vos identifiants.'
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-text-primary">
    <!-- Header style TikTok -->
    <header class="w-full h-16 border-b border-border px-6 sm:px-10 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <TipTokLogo size="md" />
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
          Connexion
        </h1>

        <!-- Alerte erreur -->
        <div
          v-if="generalError"
          class="mb-6 p-3.5 rounded-lg bg-danger-bg border border-danger-border text-danger text-xs font-medium"
        >
          {{ generalError }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- E-mail -->
          <div>
            <label for="email" class="block text-sm font-bold text-text-primary mb-2">
              Adresse e-mail
            </label>
            <input
              id="email"
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

          <!-- Mot de passe -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="password" class="block text-sm font-bold text-text-primary">
                Mot de passe
              </label>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Mot de passe"
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

          <!-- Bouton Se connecter -->
          <button
            type="submit"
            :disabled="authStore.isLoading || !isFormValid"
            class="w-full py-3 px-4 rounded-lg font-bold text-sm text-primary-content bg-primary hover:bg-primary-hover active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-3"
          >
            <Loader2 v-if="authStore.isLoading" class="w-4 h-4 animate-spin" />
            <span v-else>Se connecter</span>
          </button>
        </form>
      </div>
    </main>

    <!-- Footer style TikTok -->
    <footer class="w-full border-t border-border bg-surface py-5 px-4 text-center">
      <p class="text-sm text-text-primary">
        Tu n'as pas de compte ?
        <RouterLink
          to="/register"
          class="font-bold text-primary hover:underline ml-1.5 transition-colors"
        >
          S'inscrire
        </RouterLink>
      </p>
    </footer>
  </div>
</template>
