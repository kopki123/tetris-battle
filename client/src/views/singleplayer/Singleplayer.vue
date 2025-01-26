<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Game } from '@/tetrisGame/LocalTetris';

const canvasRef = ref();

onMounted(() => {
  const game = new Game(canvasRef.value);
  game.start();
})

</script>

<template>
  <div
    class="
      mt-14
      flex justify-center items-center
    "
  >
    <div class="w-[300px]">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>