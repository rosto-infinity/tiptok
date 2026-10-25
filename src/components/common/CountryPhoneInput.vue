<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { countryCodes, type CountryCode } from '@/constants/countryCodes'
import { ChevronDown, Search, Check, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: string
    dialCode?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    dialCode: '+225',
    placeholder: 'Numéro de téléphone',
    disabled: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'update:dialCode', code: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

// Trouver le pays actuel en fonction de dialCode
const currentCountry = computed<CountryCode>(() => {
  return (
    countryCodes.find((c) => c.dialCode === props.dialCode) ||
    countryCodes[0] || { name: "Côte d'Ivoire", code: 'CI', dialCode: '+225', flag: '🇨🇮' }
  )
})

// Filtrer la liste des pays par nom, code ou indicatif
const filteredCountries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return countryCodes
  return countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.includes(q)
  )
})

const toggleDropdown = async () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    await nextTick()
    searchInputRef.value?.focus()
  }
}

const selectCountry = (country: CountryCode) => {
  emit('update:dialCode', country.dialCode)
  isOpen.value = false
}

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

// Fermeture au clic extérieur
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative w-full" ref="dropdownRef">
    <div
      class="flex items-center rounded-lg bg-surface border border-border focus-within:border-primary transition-colors overflow-hidden"
    >
      <!-- Bouton Sélecteur de Pays avec Drapeau -->
      <button
        type="button"
        @click.stop="toggleDropdown"
        :disabled="disabled"
        class="h-12 px-3 flex items-center gap-1.5 bg-surface-elevated/40 hover:bg-surface-elevated/80 border-r border-border transition-colors cursor-pointer select-none shrink-0"
        title="Sélectionner l'indicatif pays"
      >
        <span
          class="text-xl leading-none select-none"
          style="font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif"
        >
          {{ currentCountry.flag }}
        </span>
        <span class="text-xs font-bold text-text-primary">
          {{ currentCountry.code }}
        </span>
        <span class="text-xs font-semibold text-text-secondary">
          {{ currentCountry.dialCode }}
        </span>
        <ChevronDown
          class="w-3.5 h-3.5 text-text-muted transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>

      <!-- Champ de saisie du numéro de téléphone -->
      <input
        type="tel"
        :value="modelValue"
        @input="onInput"
        :placeholder="placeholder"
        :disabled="disabled"
        class="flex-1 h-12 px-3.5 bg-transparent text-text-primary placeholder:text-text-muted text-sm outline-none"
      />
    </div>

    <!-- Menu déroulant des pays avec recherche -->
    <div
      v-if="isOpen"
      class="absolute left-0 top-full mt-1.5 w-80 max-w-[calc(100vw-2rem)] max-h-72 bg-surface border border-border rounded-xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Barre de recherche interne -->
      <div class="p-2 border-b border-border bg-surface-elevated/50">
        <div class="relative flex items-center">
          <Search class="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un pays ou un indicatif..."
            class="w-full pl-8 pr-7 py-1.5 rounded-md bg-surface border border-border text-xs text-text-primary placeholder:text-text-muted focus:border-primary outline-none"
            autofocus
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute right-2 text-text-muted hover:text-text-primary p-0.5 cursor-pointer"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
      </div>

      <!-- Liste des pays avec drapeaux -->
      <div class="flex-1 overflow-y-auto divide-y divide-border/40 py-1">
        <button
          v-for="c in filteredCountries"
          :key="c.code"
          type="button"
          @click="selectCountry(c)"
          class="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-surface-elevated transition-colors cursor-pointer group"
          :class="{ 'bg-primary/10 text-primary font-bold': c.dialCode === dialCode }"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span
              class="text-xl leading-none shrink-0"
              style="font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif"
            >
              {{ c.flag }}
            </span>
            <span class="text-xs truncate text-text-primary group-hover:text-primary transition-colors">
              {{ c.name }}
            </span>
            <span class="text-[11px] font-semibold text-text-muted">
              ({{ c.code }})
            </span>
          </div>

          <div class="flex items-center gap-1.5 shrink-0 pl-2">
            <span class="text-xs font-bold text-text-secondary">
              {{ c.dialCode }}
            </span>
            <Check
              v-if="c.dialCode === dialCode"
              class="w-3.5 h-3.5 text-primary"
            />
          </div>
        </button>

        <div
          v-if="filteredCountries.length === 0"
          class="p-4 text-center text-xs text-text-muted"
        >
          Aucun pays trouvé pour "{{ searchQuery }}"
        </div>
      </div>
    </div>
  </div>
</template>
