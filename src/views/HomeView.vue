<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import HomeHeader from '@/components/home/HomeHeader.vue'
import HomeSidebar from '@/components/home/HomeSidebar.vue'
import HomeVideoPlayer, { type VideoItem } from '@/components/home/HomeVideoPlayer.vue'
import HomeActionSidebar from '@/components/home/HomeActionSidebar.vue'
import HomeCommentsDrawer, { type CommentItem } from '@/components/home/HomeCommentsDrawer.vue'
import { ChevronUp, ChevronDown } from 'lucide-vue-next'

const authStore = useAuthStore()
const toastStore = useToastStore()

// Flux de vidéos grand format
const feed = ref<VideoItem[]>([
  {
    id: 1,
    username: 'sarah.dance',
    displayName: 'Sarah & Crew',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&auto=format&fit=crop&q=80',
    description: 'Petite chorégraphie du week-end entre amies 💃✨ Vous préférez quel passage ?',
    tags: ['#dance', '#afrobeat', '#tiptok', '#vibes'],
    music: 'Son original - Sarah Dance (Afro Pop Remix)',
    likes: 178300,
    comments: 902,
    saves: 22100,
    shares: 4292,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
  },
  {
    id: 2,
    username: 'ibra_freestyle',
    displayName: 'Ibra Skills ⚽',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=700&auto=format&fit=crop&q=80',
    description: 'Nouveau geste technique réussi après 40 essais ! Ne jamais abandonner 🔥⚽',
    tags: ['#football', '#freestyle', '#skills', '#challenge'],
    music: 'Phonk Drill - High Energy Beat',
    likes: 245100,
    comments: 1420,
    saves: 34500,
    shares: 8910,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
  },
  {
    id: 3,
    username: 'chef_amina',
    displayName: 'Amina Cuisine 👩🏽‍🍳',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&auto=format&fit=crop&q=80',
    description: 'Recette express du Garba et Alloco maison prêt en 15 minutes chrono ! 🤤🍗',
    tags: ['#recette', '#food', '#cuisine', '#abidjan'],
    music: 'Ambiance Gourmande - Acoustic Lofi',
    likes: 89400,
    comments: 450,
    saves: 15300,
    shares: 2150,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
  },
])

const currentIndex = ref(0)
const isCommentDrawerOpen = ref(false)

const currentVideo = computed(() => feed.value[currentIndex.value] ?? feed.value[0]!)

// Navigation
const nextVideo = () => {
  if (currentIndex.value < feed.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

const prevVideo = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = feed.value.length - 1
  }
}

// Raccourcis clavier (Flèche Haut / Bas)
const handleKeyDown = (e: KeyboardEvent) => {
  if (isCommentDrawerOpen.value) return
  if (e.key === 'ArrowDown') {
    nextVideo()
  } else if (e.key === 'ArrowUp') {
    prevVideo()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Actions
const handleLike = () => {
  if (currentVideo.value.isLiked) {
    currentVideo.value.likes--
    currentVideo.value.isLiked = false
  } else {
    currentVideo.value.likes++
    currentVideo.value.isLiked = true
  }
}

const handleSave = () => {
  if (currentVideo.value.isSaved) {
    currentVideo.value.saves--
    currentVideo.value.isSaved = false
  } else {
    currentVideo.value.saves++
    currentVideo.value.isSaved = true
    toastStore.success('Vidéo ajoutée aux favoris !')
  }
}

const handleFollow = () => {
  currentVideo.value.isFollowed = !currentVideo.value.isFollowed
  if (currentVideo.value.isFollowed) {
    toastStore.success(`Vous suivez désormais @${currentVideo.value.username}`)
  }
}

const handleShare = () => {
  navigator.clipboard.writeText(window.location.href)
  toastStore.success('Lien copié dans le presse-papier !')
}

// Commentaires
const sampleComments = ref<CommentItem[]>([
  { id: 1, user: 'david_92', text: 'Incroyable énergie sur ce son ! 🔥', time: 'Il y a 2h', likes: 24 },
  { id: 2, user: 'mariam.ci', text: 'Trop fluide la transition à 0:12 👏🏽', time: 'Il y a 5h', likes: 8 },
  { id: 3, user: 'kevin_beat', text: 'Le remix est disponible où svp ?', time: 'Il y a 1j', likes: 3 },
])

const handleAddComment = (text: string) => {
  sampleComments.value.unshift({
    id: Date.now(),
    user: authStore.user?.name || 'Moi',
    text,
    time: 'À l’instant',
    likes: 0,
  })
  currentVideo.value.comments++
  toastStore.success('Commentaire envoyé !')
}

const handleSearch = (query: string) => {
  if (query.trim()) {
    toastStore.info(`Recherche : "${query}"`)
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary flex flex-col">
    <!-- 1. En-tête TikTok modulaire -->
    <HomeHeader @search="handleSearch" />

    <!-- 2. Corps : Sidebar gauche + Lecteur Vidéo Grand Format Immersif -->
    <div class="flex-1 flex max-w-[1440px] mx-auto w-full">
      <!-- Sidebar de Navigation -->
      <HomeSidebar />

      <!-- Flux Vidéo Grand Format Agrandit -->
      <main class="flex-1 flex items-center justify-center p-2 sm:p-5 overflow-hidden relative">
        <div class="flex items-end gap-5 max-w-4xl w-full justify-center">
          <!-- Lecteur Vidéo Agrandit -->
          <HomeVideoPlayer :video="currentVideo" />

          <!-- Barre d'actions latérale (Like, Commentaire, Favori, Partage) -->
          <HomeActionSidebar
            :video="currentVideo"
            @like="handleLike"
            @save="handleSave"
            @share="handleShare"
            @follow="handleFollow"
            @open-comments="isCommentDrawerOpen = true"
          />

          <!-- Boutons Flottants Haut/Bas pour Défiler -->
          <div class="hidden sm:flex flex-col gap-2 shrink-0 ml-2">
            <button
              @click="prevVideo"
              class="w-11 h-11 rounded-full bg-surface border border-border text-text-primary hover:bg-surface-hover flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-90"
              title="Vidéo précédente (Touche Haut)"
            >
              <ChevronUp class="w-5 h-5" />
            </button>
            <button
              @click="nextVideo"
              class="w-11 h-11 rounded-full bg-surface border border-border text-text-primary hover:bg-surface-hover flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-90"
              title="Vidéo suivante (Touche Bas)"
            >
              <ChevronDown class="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- 3. Tiroir Latéral des Commentaires -->
    <HomeCommentsDrawer
      :is-open="isCommentDrawerOpen"
      :total-count="currentVideo.comments"
      :comments="sampleComments"
      @close="isCommentDrawerOpen = false"
      @add-comment="handleAddComment"
    />
  </div>
</template>
