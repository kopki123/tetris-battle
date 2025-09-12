import { Server, Socket } from 'socket.io';
import gameHandler from './game.js';

export default (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // 將不同邏輯分模組處理
    gameHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};