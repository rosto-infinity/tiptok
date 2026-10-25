<script setup lang="ts">
import { ref, watch } from 'vue'
import { Volume2, VolumeX, Disc, Copy, Check, Terminal, Sparkles } from 'lucide-vue-next'

export interface VideoItem {
  id: number
  username: string
  displayName: string
  avatar: string
  category?: string
  title?: string
  description: string
  codeSnippet?: string
  gradient?: string
  videoUrl?: string
  poster?: string
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
const isCopied = ref(false)

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

const copyCode = () => {
  if (!props.video.codeSnippet) return
  navigator.clipboard.writeText(props.video.codeSnippet)
  isCopied.value = true
  setTimeout(() => (isCopied.value = false), 2000)
}

watch(
  () => props.video.id,
  () => {
    isCopied.value = false
    if (videoPlayer.value && props.video.videoUrl) {
      videoPlayer.value.currentTime = 0
      videoPlayer.value.play().catch(() => {})
      isPlaying.value = true
    }
  },
)
</script>

<template>
  <!-- LECTEUR CARTE TIPTOK / VIDÉO GRAND FORMAT AGRANDI -->
  <div
    class="relative w-full max-w-[440px] sm:max-w-[490px] lg:max-w-[540px] xl:max-w-[560px] h-[calc(100vh-85px)] max-h-[860px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group select-none shrink-0 flex flex-col justify-between"
    :style="props.video.gradient ? { background: props.video.gradient } : { backgroundColor: '#090D16' }"
  >
    <!-- CAS 1 : Vidéo en arrière-plan si fournie -->
    <video
      v-if="props.video.videoUrl"
      ref="videoPlayer"
      :src="props.video.videoUrl"
      :poster="props.video.poster"
      autoplay
      loop
      playsinline
      :muted="isMuted"
      @click="togglePlay"
      class="absolute inset-0 w-full h-full object-cover cursor-pointer z-0"
    ></video>

    <!-- Dégradé ambient et grille tech de fond -->
    <div
      v-if="!props.video.videoUrl"
      class="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"
    ></div>

    <!-- 1. En-tête de la carte (Pill de Catégorie & Bouton Son) -->
    <div class="relative z-10 p-5 flex items-center justify-between pointer-events-auto">
      <div
        v-if="props.video.category"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-black uppercase tracking-wider shadow-lg"
      >
        <Sparkles class="w-3.5 h-3.5 text-primary" />
        <span>{{ props.video.category }}</span>
      </div>
      <div v-else></div>

      <button
        @click.stop="toggleMute"
        class="p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer shadow-md"
        title="Couper / Activer l'ambiance sonore"
      >
        <VolumeX v-if="isMuted" class="w-4 h-4" />
        <Volume2 v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- 2. Corps Central : Titre Percutant & Snippet Terminal Stylisé (Format TikTok TipCard) -->
    <div class="relative z-10 px-5 sm:px-6 my-auto space-y-4">
      <!-- Titre du Tip -->
      <h2
        v-if="props.video.title"
        class="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md tracking-tight"
      >
        {{ props.video.title }}
      </h2>

      <!-- Terminal macOS Glassmorphism pour Code Snippet -->
      <div
        v-if="props.video.codeSnippet"
        class="rounded-xl bg-black/70 backdrop-blur-md border border-white/15 p-3.5 shadow-2xl text-left overflow-hidden group/code relative"
      >
        <!-- Barre de titre du terminal macOS -->
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-danger/80"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-warning/80"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-success/80"></span>
            <span class="ml-2 text-[10px] text-white/50 font-mono font-semibold flex items-center gap-1">
              <Terminal class="w-3 h-3" />
              <span>tip.snippet</span>
            </span>
          </div>

          <button
            @click="copyCode"
            class="text-[11px] font-semibold text-white/70 hover:text-white px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 cursor-pointer"
            title="Copier le code"
          >
            <Check v-if="isCopied" class="w-3 h-3 text-success" />
            <Copy v-else class="w-3 h-3" />
            <span>{{ isCopied ? 'Copié !' : 'Copier' }}</span>
          </button>
        </div>

        <!-- Contenu du snippet -->
        <pre class="font-mono text-xs sm:text-sm text-white/90 overflow-x-auto leading-relaxed py-1 selection:bg-primary/30"><code>{{ props.video.codeSnippet }}</code></pre>
      </div>
    </div>

    <!-- 3. Bas de carte : Infos Créateur, Description (280 car.) & Piste Audio Défilante -->
    <div class="relative z-10 p-5 pt-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white space-y-2 pointer-events-none">
      <!-- Identifiant du créateur -->
      <div class="flex items-center gap-2 pointer-events-auto">
        <span class="font-extrabold text-base tracking-tight hover:underline cursor-pointer">
          @{{ props.video.username }}
        </span>
        <span class="text-xs text-white/70 font-medium">• {{ props.video.displayName }}</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">PRO</span>
      </div>

      <!-- Description et hashtags (280 car.) -->
      <p class="text-xs sm:text-sm text-white/95 leading-relaxed pointer-events-auto">
        {{ props.video.description }}
        <span
          v-for="tag in props.video.tags"
          :key="tag"
          class="font-semibold text-primary ml-1 hover:underline cursor-pointer"
        >
          {{ tag }}
        </span>
      </p>

      <!-- Piste audio défilante avec vinyle animé -->
      <div class="flex items-center gap-2 text-xs text-white/85 pt-1.5 pointer-events-auto">
        <Disc class="w-4 h-4 animate-spin text-primary shrink-0" style="animation-duration: 4s" />
        <span class="truncate text-xs font-semibold">{{ props.video.music }}</span>
      </div>
    </div>
  </div>
</template>
