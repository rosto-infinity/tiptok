<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next'

const toastStore = useToastStore()

const typeStyles = {
  success: 'border-success-border bg-surface text-text-primary',
  danger: 'border-danger-border bg-surface text-text-primary',
  info: 'border-border bg-surface text-text-primary',
}

const iconComponents = {
  success: CheckCircle2,
  danger: AlertCircle,
  info: Info,
}

const iconColors = {
  success: 'text-success',
  danger: 'text-danger',
  info: 'text-primary',
}
</script>

<template>
  <div
    class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
  >
    <div
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      :class="[
        typeStyles[toast.type],
        'pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all duration-200',
      ]"
    >
      <component
        :is="iconComponents[toast.type]"
        :class="[iconColors[toast.type], 'w-5 h-5 shrink-0 mt-0.5']"
      />
      <div class="flex-1 text-sm font-medium leading-snug">
        {{ toast.message }}
      </div>
      <button
        @click="toastStore.remove(toast.id)"
        class="text-text-muted hover:text-text-primary transition-colors p-0.5 rounded cursor-pointer"
        aria-label="Fermer"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
