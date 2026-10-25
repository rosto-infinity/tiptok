<script setup lang="ts">
import { ref } from 'vue'
import { X, Send } from 'lucide-vue-next'

export interface CommentItem {
  id: number
  user: string
  text: string
  time: string
  likes: number
}

const props = defineProps<{
  isOpen: boolean
  totalCount: number
  comments: CommentItem[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add-comment', text: string): void
}>()

const commentInput = ref('')

const handleSend = () => {
  if (!commentInput.value.trim()) return
  emit('add-comment', commentInput.value.trim())
  commentInput.value = ''
}
</script>

<template>
  <div
    v-if="props.isOpen"
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-md bg-surface h-full flex flex-col border-l border-border shadow-2xl animate-in slide-in-from-right">
      <!-- En-tête -->
      <div class="p-4 border-b border-border flex items-center justify-between">
        <h3 class="text-base font-bold text-text-primary">
          Commentaires ({{ props.totalCount }})
        </h3>
        <button
          @click="emit('close')"
          class="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover cursor-pointer"
          title="Fermer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Liste des commentaires -->
      <div class="flex-1 p-4 overflow-y-auto space-y-4">
        <div
          v-for="comm in props.comments"
          :key="comm.id"
          class="flex items-start gap-3"
        >
          <div class="w-8 h-8 rounded-full bg-primary-subtle text-primary font-bold text-xs flex items-center justify-center shrink-0">
            {{ comm.user.substring(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1 text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-text-primary">@{{ comm.user }}</span>
              <span class="text-text-muted text-[10px]">{{ comm.time }}</span>
            </div>
            <p class="text-text-secondary mt-1 text-xs leading-relaxed">
              {{ comm.text }}
            </p>
          </div>
        </div>
      </div>

      <!-- Zone de saisie d'un nouveau commentaire -->
      <div class="p-3 border-t border-border bg-surface flex items-center gap-2">
        <input
          v-model="commentInput"
          type="text"
          placeholder="Ajouter un commentaire..."
          @keyup.enter="handleSend"
          class="flex-1 px-3.5 py-2.5 rounded-full bg-surface-hover border border-border text-xs text-text-primary focus:outline-none focus:border-primary"
        />
        <button
          @click="handleSend"
          :disabled="!commentInput.trim()"
          class="p-2.5 rounded-full bg-primary text-primary-content hover:bg-primary-hover disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
