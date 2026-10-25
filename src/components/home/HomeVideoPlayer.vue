<script setup lang="ts">
import { ref, watch } from 'vue'
import { Volume2, VolumeX, Play, Disc } from 'lucide-vue-next'

export interface VideoItem {
  id: number
  username: string
  displayName: string
  avatar: string
  videoUrl: string
  poster: string
  description: string
  tags: string[]
  music: string
  likes: number
  comments: number
  saves: number
  shares: number
  isLiked: boolean
  isSaved: boolean
  isFollowed: boolean
}

const props = defineProps<{
  video: VideoItem
}>()

const videoPlayer = ref<HTMLVideoElement | null>(null)
const isMuted = ref(true)
const isPlaying = ref(true)

const togglePlay = () => {
  if (!videoPlayer.value) return
  if (videoPlayer.value.paused) {
    videoPlayer.value.play()
    isPlaying.value = true
  } else {
    videoPlayer.value.pause()
    isPlaying.value = false
  }
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  if (videoPlayer.value) {
    videoPlayer.value.muted = isMuted.value
  }
}

// Relance automatique de la lecture quand la vidéo change
watch(
  () => props.video.id,
  () => {
    if (videoPlayer.value) {
      videoPlayer.value.currentTime = 0
      videoPlayer.value.play().catch(() => {})
      isPlaying.value = true
    }
  },
)
</script>

<template>
  <!-- LECTEUR VIDÉO GRAND FORMAT AGRANDI (comme sur le vrai TikTok Web) -->
  <div
    class="relative w-full max-w-[440px] sm:max-w-[490px] lg:max-w-[540px] xl:max-w-[560px] h-[calc(100vh-85px)] max-h-[860px] rounded-2xl overflow-hidden bg-black shadow-2xl border border-border/80 group select-none shrink-0"
  >
    <!-- Élément Vidéo natif haute fluidité -->
    <video
      ref="videoPlayer"
      :src="props.video.videoUrl"
      :poster="props.video.poster"
      autoplay
      loop
      playsinline
      :muted="isMuted"
      @click="togglePlay"
      class="w-full h-full object-cover cursor-pointer"
    ></video>

    <!-- Bouton Mute en haut à gauche -->
    <button
      @click.stop="toggleMute"
      class="absolute top-4 left-4 p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-sm transition-colors cursor-pointer"
      title="Couper / Activer le son"
    >
      <VolumeX v-if="isMuted" class="w-4 h-4" />
      <Volume2 v-else class="w-4 h-4" />
    </button>

    <!-- Icône Pause flottante centrale -->
    <div
      v-if="!isPlaying"
      @click="togglePlay"
      class="absolute inset-0 flex items-center justify-center bg-black/35 cursor-pointer pointer-events-auto"
    >
      <div class="w-18 h-18 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm shadow-xl">
        <Play class="w-9 h-9 fill-current ml-1" />
      </div>
    </div>

    <!-- Overlay d'informations au bas de la vidéo -->
    <div class="absolute bottom-0 inset-x-0 p-5 pt-20 bg-gradient-to-t from-black/90 via-black/45 to-transparent text-white space-y-2 pointer-events-none">
      <!-- Identifiant du créateur -->
      <div class="flex items-center gap-2 pointer-events-auto">
        <span class="font-extrabold text-base tracking-tight hover:underline cursor-pointer">
          @{{ props.video.username }}
        </span>
        <span class="text-xs text-white/70 font-medium">• {{ props.video.displayName }}</span>
      </div>

      <!-- Description et hashtags -->
      <p class="text-xs sm:text-sm text-white/95 leading-snug line-clamp-2 pointer-events-auto">
        {{ props.video.description }}
        <span
          v-for="tag in props.video.tags"
          :key="tag"
          class="font-semibold text-primary ml-1 hover:underline cursor-pointer"
        >
          {{ tag }}
        </span>
      </p>

      <!-- Piste musicale avec disque vinyle qui tourne -->
      <div class="flex items-center gap-2 text-xs text-white/85 pt-1.5 pointer-events-auto">
        <Disc class="w-4 h-4 animate-spin text-primary shrink-0" style="animation-duration: 4s" />
        <span class="truncate text-xs font-semibold">{{ props.video.music }}</span>
      </div>
    </div>
  </div>
</template>
