import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'danger' | 'info'
  message: string
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const add = (message: string, type: 'success' | 'danger' | 'info' = 'info', durationMs = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    toasts.value.push({ id, type, message })

    if (durationMs > 0) {
      setTimeout(() => {
        remove(id)
      }, durationMs)
    }
  }

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (message: string, durationMs = 4000) => add(message, 'success', durationMs)
  const error = (message: string, durationMs = 5000) => add(message, 'danger', durationMs)
  const info = (message: string, durationMs = 4000) => add(message, 'info', durationMs)

  return {
    toasts,
    add,
    remove,
    success,
    error,
    info,
  }
})
