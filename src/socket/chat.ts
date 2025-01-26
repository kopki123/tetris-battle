import { Server, Socket } from 'socket.io';

const chatHandler = (io: Server, socket: Socket): void => {
  socket.on('chat:message', (data: { message: string }) => {
    console.log(`Message received: ${data.message}`);

    io.emit('chat:message', {
      user: socket.id,
      message: data.message,
    });
  });

  io.emit('chat:message', 'hello world');

  socket.on('chat:joinRoom', (room: string) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    socket.to(room).emit('chat:joined', { user: socket.id });
  });
};

export default chatHandler;