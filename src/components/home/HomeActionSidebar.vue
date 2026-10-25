<script setup lang="ts">
import type { VideoItem } from './HomeVideoPlayer.vue'
import { Heart, MessageCircle, Bookmark, Share2, Plus } from 'lucide-vue-next'

const props = defineProps<{
  video: VideoItem
}>()

const emit = defineEmits<{
  (e: 'like'): void
  (e: 'save'): void
  (e: 'share'): void
  (e: 'follow'): void
  (e: 'open-comments'): void
}>()

const formatCount = (count: number) => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}
</script>

<template>
  <div class="flex flex-col items-center gap-5 pb-3 shrink-0 select-none">
    <!-- Avatar Créateur avec bouton Suivre + -->
    <div class="relative mb-1">
      <img
        :src="props.video.avatar"
        :alt="props.video.username"
        class="w-13 h-13 rounded-full border-2 border-white object-cover bg-surface shadow-md"
      />
      <button
        v-if="!props.video.isFollowed"
        @click="emit('follow')"
        class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5.5 h-5.5 rounded-full bg-primary text-primary-content flex items-center justify-center font-black text-xs shadow-md hover:scale-115 active:scale-95 transition-transform cursor-pointer"
        title="Suivre ce créateur"
      >
        <Plus class="w-4 h-4 stroke-[3]" />
      </button>
    </div>

    <!-- Bouton J'aime (Like) -->
    <button
      @click="emit('like')"
      class="flex flex-col items-center gap-1 group cursor-pointer"
      title="J'aime"
    >
      <div
        :class="[
          props.video.isLiked ? 'bg-danger text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-elevated',
          'w-12 h-12 rounded-full flex items-center justify-center shadow-xs transition-transform active:scale-90',
        ]"
      >
        <Heart :class="[props.video.isLiked ? 'fill-current' : '', 'w-6 h-6']" />
      </div>
      <span class="text-xs font-bold text-text-primary">
        {{ formatCount(props.video.likes) }}
      </span>
    </button>

    <!-- Bouton Commentaires -->
    <button
      @click="emit('open-comments')"
      class="flex flex-col items-center gap-1 group cursor-pointer"
      title="Commentaires"
    >
      <div class="w-12 h-12 rounded-full bg-surface-hover hover:bg-surface-elevated text-text-primary flex items-center justify-center shadow-xs transition-transform active:scale-90">
        <MessageCircle class="w-6 h-6" />
      </div>
      <span class="text-xs font-bold text-text-primary">
        {{ formatCount(props.video.comments) }}
      </span>
    </button>

    <!-- Bouton Favoris / Enregistrer -->
    <button
      @click="emit('save')"
      class="flex flex-col items-center gap-1 group cursor-pointer"
      title="Ajouter aux favoris"
    >
      <div
        :class="[
          props.video.isSaved ? 'bg-warning text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-elevated',
          'w-12 h-12 rounded-full flex items-center justify-center shadow-xs transition-transform active:scale-90',
        ]"
      >
        <Bookmark :class="[props.video.isSaved ? 'fill-current' : '', 'w-6 h-6']" />
      </div>
      <span class="text-xs font-bold text-text-primary">
        {{ formatCount(props.video.saves) }}
      </span>
    </button>

    <!-- Bouton Partager -->
    <button
      @click="emit('share')"
      class="flex flex-col items-center gap-1 group cursor-pointer"
      title="Partager"
    >
      <div class="w-12 h-12 rounded-full bg-surface-hover hover:bg-surface-elevated text-text-primary flex items-center justify-center shadow-xs transition-transform active:scale-90">
        <Share2 class="w-6 h-6" />
      </div>
      <span class="text-xs font-bold text-text-primary">
        {{ formatCount(props.video.shares) }}
      </span>
    </button>
  </div>
</template>
