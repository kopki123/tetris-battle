<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Game as LocalGame } from '@/tetrisGame/LocalTetris';
import { Game as RemoteGame } from '@/tetrisGame/RemoteTetris';
import { socket } from '@/socket';
import { useBattleStore } from '@/stores/battle';

const battleStore = useBattleStore();
const router = useRouter();

const localGameCanvasRef = ref();
const remoteGameCanvasRef = ref();

const winner = ref<'Opponent' | 'You' | null>(null);
const isGameOver = ref(false);

function handleGameOver() {
  router.push('/');
}

onMounted(() => {
  const localGame = new LocalGame(localGameCanvasRef.value, false);
  const remoteGame = new RemoteGame(remoteGameCanvasRef.value);

  localGame.start(() => {
    battleStore.updateGameState({
      gameBoard: localGame.gameBoard,
      fallingPiece: localGame.fallingPiece,
      nextPiece: localGame.nextPiece,
      score: localGame.score,
      isFastDropping: localGame.isFastDropping,
      isGameOver: localGame.isGameOver,
      isPaused: localGame.isPaused,
    });

    if (localGame.isGameOver) {
      socket.emit('game:gameOver');
    }
  });

  remoteGame.start();

  socket.on('game:updateOpponentState', (state) => {
    remoteGame.update(state);
  });

  socket.on('game:gameOver', ({ winner: winnerId }) => {
    isGameOver.value = true;
    remoteGame.isGameOver = true;
    localGame.isGameOver = true;

    if (winnerId === socket.id) {
      winner.value = 'You';
    } else {
      winner.value = 'Opponent';
    }

    socket.emit('game:gameEnd');
  });

  socket.on('game:playerDisconnected', () => {
    isGameOver.value = true;
    remoteGame.isGameOver = true;
    localGame.isGameOver = true;

    winner.value = 'You';
  });
})

onBeforeUnmount(() => {
  socket.off('game:updateOpponentState');
  socket.off('game:gameOver');
  socket.off('game:playerDisconnected');
})

</script>

<template>
  <div
    class="
      mt-14
      flex justify-around items-center
    "
  >
    <canvas ref="localGameCanvasRef" />
    <canvas ref="remoteGameCanvasRef" />
  </div>

  <v-dialog
    v-model="isGameOver"
    :persistent="true"
    width="auto"
  >
    <v-card
      width="400"
      :text="`贏家: ${winner === 'Opponent' ? '對手' : '你'}`"
    >
      <template v-slot:actions>
        <v-btn
          class="ms-auto"
          text="Ok"
          @click="handleGameOver"
        />
      </template>
    </v-card>
  </v-dialog>
</template>

