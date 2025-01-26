import { reactive } from 'vue';
import { io } from 'socket.io-client';

export const socket = io('/', { path: '/socket.io' });

export const state = reactive({
  connected: false,
});

socket.on('connect', () => {
  state.connected = true;
});

socket.on('disconnect', () => {
  state.connected = false;
});