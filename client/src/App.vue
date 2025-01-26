<script setup lang="ts">
import { useBattleStore } from '@/stores/battle';
import Navbar from '@/components/Navbar.vue';

const battleStore = useBattleStore();

battleStore.bindEvents();

</script>

<template>
  <Navbar />
  <RouterView />
</template>

<style lang="scss">

html,
body {
  font-family: "Noto Sans TC", sans-serif;
}

#app {
  height: 100vh;
}

img {
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  position: absolute;
  opacity: 0;
}

</style>
