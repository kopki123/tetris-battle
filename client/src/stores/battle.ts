import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import { socket } from '@/socket';
import Piece from '@/tetrisGame/Piece';

export const useBattleStore = defineStore('battle', {
  state: () => ({
    roomId: null as string | null,
  }),
  actions: {
    bindEvents() {
      const router = useRouter();

      socket.on('updatePlayers', (roomId) => {
        this.roomId = roomId;
        console.log(this.roomId);
      });

      socket.on('game:startGame', () => {
        router.push('/multiplayer');
      });
    },
    updateGameState(state: {
      gameBoard: number[][],
      fallingPiece: null | Piece,
      nextPiece: null | Piece,
      score: number,
      isFastDropping: boolean,
      isGameOver: boolean,
      isPaused: boolean,
    }) {
      socket.emit('game:updateState', {
        roomId: this.roomId,
        state,
      });
    },
    joinRoom() {
      socket.emit('game:joinRoom');
    },
  },
});