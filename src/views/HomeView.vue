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

const activeTab = ref<'for-you' | 'following'>('for-you')

// Flux de Tips TipTok (Cartes Micro-Contenus Tech & Performance)
const feed = ref<VideoItem[]>([
  {
    id: 1,
    username: 'taylor_dev',
    displayName: 'Taylor Otwell',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    category: '🔥 LARAVEL 13 EN DIRECT',
    title: 'La diffusion en direct ultra-rapide !',
    description: 'Plus besoin d’abonnements tiers coûteux : profitez d’un moteur de diffusion instantanée en temps réel gérant des dizaines de milliers d’interactions en direct sur vos serveurs ! 🚀',
    codeSnippet: 'php artisan install:broadcasting\n// Diffusion instantanée sur le canal direct !\nPostLikedEvent::dispatch($post->id, $count);',
    gradient: 'linear-gradient(135deg, #FF2D20 0%, #B91C1C 40%, #0F172A 100%)',
    tags: ['#laravel13', '#tempsreel', '#websockets', '#performance'],
    music: 'Tech Beats - Live Broadcast Stream (128 BPM)',
    likes: 48200,
    comments: 1240,
    saves: 14200,
    shares: 3890,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
  },
  {
    id: 2,
    username: 'eva_vue',
    displayName: 'Eva Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    category: '⚡️ VUE 3.5 & PINIA',
    title: 'La fin des template refs fragiles !',
    description: 'Avec Vue 3.5, utilisez useTemplateRef() pour lier vos composants sans risque de désynchronisation de chaîne. Plus propre, 100% typé avec TypeScript ! 💡',
    codeSnippet: '// Vue 3.5+ syntaxe native et typée\nconst inputEl = useTemplateRef<HTMLInputElement>(\'phoneInput\')\ninputEl.value?.focus()',
    gradient: 'linear-gradient(135deg, #42B883 0%, #0F766E 50%, #0B0F19 100%)',
    tags: ['#vue3', '#compositionapi', '#typescript', '#vite'],
    music: 'Lofi Code Lounge - Midnight Debugging Beats',
    likes: 62400,
    comments: 890,
    saves: 19500,
    shares: 5120,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
  },
  {
    id: 3,
    username: 'koffi_code',
    displayName: 'Koffi Kouamé',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    category: '🚀 PERFORMANCE DATABASE',
    title: 'Stoppez les 500 requêtes SQL cachées !',
    description: 'Activez Model::preventLazyLoading() en local pour lever immédiatement une exception dès qu’une relation n’est pas eager loaded avec with([\'user\']). ⚡️',
    codeSnippet: '// AppServiceProvider::boot()\nModel::preventLazyLoading(!app()->isProduction());\n// Élimine 95% des latences SQL N+1 !',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 50%, #090D16 100%)',
    tags: ['#eloquent', '#sql', '#cleancode', '#performances'],
    music: 'Cyberpunk Pulse - Zero Latency Engine',
    likes: 89100,
    comments: 2150,
    saves: 31200,
    shares: 7420,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
  },
  {
    id: 4,
    username: 'dev_alex',
    displayName: 'Alexandre V.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    category: '🛡️ SÉCURITÉ & ANTI-INTRUSION',
    title: 'Zéro fuite d’architecture sur vos API !',
    description: 'Ne laissez jamais un 401 afficher une stack trace debug. Renvoyez toujours un JSON strict sans redirection pour empêcher les attaquants de cartographier vos fichiers. 🔒',
    codeSnippet: '$middleware->redirectTo(guests: fn ($req) =>\n    $req->is(\'api/*\') ? null : \'/auth/login\'\n);\n// JSON 401 strict & headers OWASP !',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 45%, #180816 100%)',
    tags: ['#cybersecurity', '#owasp', '#sanctum', '#fortify'],
    music: 'Defensive Shield - Dark Ambient Electro',
    likes: 35800,
    comments: 620,
    saves: 11400,
    shares: 2840,
    isLiked: false,
    isSaved: false,
    isFollowed: false,
  },
  {
    id: 5,
    username: 'amina_tech',
    displayName: 'Amina Sow',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    category: '🎨 DESIGN SYSTEM 2026',
    title: 'Adieu tailwind.config.js, bonjour @theme !',
    description: 'Tailwind CSS v4 est 100% CSS-first. Déclarez vos tokens HSL personnalisés dans app.css avec @theme pour un switch light/dark fluide sans aucune surcharge JS ! 🎯',
    codeSnippet: '@import "tailwindcss";\n@theme {\n  --color-primary: var(--primary);\n  --font-mono: \'JetBrains Mono\';\n}',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 50%, #081B2B 100%)',
    tags: ['#tailwindv4', '#css', '#designsystem', '#frontend'],
    music: 'Deep Focus - Ambient Coffeehouse Code',
    likes: 51200,
    comments: 1105,
    saves: 16800,
    shares: 4190,
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
    toastStore.success('Astuce sauvegardée dans vos favoris !')
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
  toastStore.success('Lien du tip copié dans le presse-papier !')
}

// Commentaires authentiques axés Tech & Performance
const sampleComments = ref<CommentItem[]>([
  { id: 1, user: 'david_dev', text: 'La directive preventLazyLoading() m’a sauvé un endpoint qui passait de 4s à 35ms 🤯', time: 'Il y a 2h', likes: 45 },
  { id: 2, user: 'sarah_ci', text: 'La diffusion en direct tourne sur nos serveurs sans le moindre crash, une vraie réussite !', time: 'Il y a 4h', likes: 28 },
  { id: 3, user: 'moussa_web', text: 'Le format scroll vertical snap-y de TipTok pour lire des astuces de dev est tellement plus percutant 🔥', time: 'Il y a 8h', likes: 19 },
  { id: 4, user: 'claire_js', text: 'Super propre le snippet Vue 3.5 useTemplateRef, 100% typé avec TypeScript !', time: 'Il y a 1j', likes: 12 },
  { id: 5, user: 'brahim_lead', text: 'Et n’oubliez pas les index composites sur vos clés étrangères dans vos migrations SQL 🚀', time: 'Il y a 1j', likes: 34 },
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
  toastStore.success('Commentaire publié sur le flux !')
}

const handleSearch = (query: string) => {
  if (query.trim()) {
    toastStore.info(`Recherche : "${query}"`)
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary flex flex-col">
    <!-- 1. En-tête TipTok modulaire -->
    <HomeHeader @search="handleSearch" />

    <!-- 2. Corps : Sidebar gauche + Lecteur Carte TipTok Format Immersif -->
    <div class="flex-1 flex max-w-[1440px] mx-auto w-full">
      <!-- Sidebar de Navigation Tech -->
      <HomeSidebar />

      <!-- Flux Carte TipTok Format Plein Écran -->
      <main class="flex-1 flex flex-col items-center justify-center p-2 sm:p-5 overflow-hidden relative">
        <!-- Onglets TikTok : Pour toi & Abonnements -->
        <div class="flex items-center gap-6 mb-3 select-none">
          <button
            @click="activeTab = 'for-you'"
            class="text-sm sm:text-base font-black tracking-tight pb-1 border-b-2 transition-all cursor-pointer"
            :class="activeTab === 'for-you' ? 'border-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'"
          >
            Pour toi
          </button>
          <button
            @click="activeTab = 'following'"
            class="text-sm sm:text-base font-black tracking-tight pb-1 border-b-2 transition-all cursor-pointer"
            :class="activeTab === 'following' ? 'border-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'"
          >
            Abonnements
          </button>
        </div>

        <div class="flex items-end gap-5 max-w-4xl w-full justify-center">
          <!-- Carte Tip / Lecteur Vidéo Agrandit -->
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
              title="Astuce précédente (Touche Haut)"
            >
              <ChevronUp class="w-5 h-5" />
            </button>
            <button
              @click="nextVideo"
              class="w-11 h-11 rounded-full bg-surface border border-border text-text-primary hover:bg-surface-hover flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-90"
              title="Astuce suivante (Touche Bas)"
            >
              <ChevronDown class="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- 3. Tiroir Latéral des Commentaires en Direct (Reverb) -->
    <HomeCommentsDrawer
      :is-open="isCommentDrawerOpen"
      :total-count="currentVideo.comments"
      :comments="sampleComments"
      @close="isCommentDrawerOpen = false"
      @add-comment="handleAddComment"
    />
  </div>
</template>
