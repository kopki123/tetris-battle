<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBattleStore } from '@/stores/battle';

const router = useRouter();
const battleStore = useBattleStore();

const multiplayerText = computed(() => battleStore.roomId ? 'Waiting for player...' : '2p multiplayer mode');

function joinRoom() {
  if (!battleStore.roomId) {
    battleStore.joinRoom();
  }
}

</script>

<template>
  <div
    class="
      mt-6
      flex flex-col items-center justify-center gap-6
    "
  >
    <v-btn
      v-text="'1p single mode'"
      variant="outlined"
      size="x-large"
      @click="router.push('/singleplayer')"
    />

    <v-btn
      v-text="multiplayerText"
      variant="outlined"
      size="x-large"
      :disabled="!!battleStore.roomId"
      @click="joinRoom"
    />
  </div>
</template>

