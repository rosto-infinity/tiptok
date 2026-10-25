<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showText: true,
})

const iconSizes = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const textStyles = {
  sm: 'text-lg font-black',
  md: 'text-2xl font-black',
  lg: 'text-3xl font-black',
  xl: 'text-4xl font-black',
}
</script>

<template>
  <div class="inline-flex items-center gap-3 select-none">
    <!-- Icône vectorielle SVG pure (infiniment nette, zéro pixel) à gauche -->
    <img
      src="/icon.svg"
      alt="TipTok Icon"
      :class="[
        iconSizes[props.size],
        'shrink-0 object-contain transition-transform duration-150 hover:scale-105',
      ]"
    />

    <!-- Titre typographique à droite de l'icône -->
    <span
      v-if="props.showText"
      :class="[
        textStyles[props.size],
        'tracking-tight text-text-primary flex items-center uppercase leading-none',
      ]"
    >
      Tip<span class="text-primary font-black ml-0.5">Tok</span>
    </span>
  </div>
</template>
