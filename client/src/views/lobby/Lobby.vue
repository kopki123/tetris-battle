<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useBattleStore } from '../../stores/battle';

const router = useRouter();
const battleStore = useBattleStore();
const { t } = useI18n();

const multiplayerText = computed(() => battleStore.roomId ? t('waiting_for_player'): t('2p_multiplayer_mode'));

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
      v-text="t('1p_single_mode')"
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

