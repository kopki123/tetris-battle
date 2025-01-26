import { Server, Socket } from 'socket.io';

const MAX_PLAYERS_PER_ROOM = 2;
const rooms = {};

const gameHandler = (io: Server, socket: Socket): void => {
  let assignedRoom = null;

  // setInterval(() => {
  //   const socketrooms = io.sockets.adapter.rooms;
  //   console.log('所有房間狀態:');
  //   for (const [room, sockets] of socketrooms) {
  //     console.log(`房間名稱: ${room}, 連線數: ${sockets.size}`);
  //   }
  //   console.log(rooms);
  //   console.log('--------------');
  // }, 5000);

  socket.on('game:joinRoom', () => {
    for (const roomId in rooms) {
      if (rooms[roomId].length < MAX_PLAYERS_PER_ROOM) {
        assignedRoom = roomId;
        break;
      }
    }

    if (!assignedRoom) {
      assignedRoom = `room-${Object.keys(rooms).length + 1}`;
      rooms[assignedRoom] = [];
    }


    rooms[assignedRoom].push(socket.id);
    socket.join(assignedRoom);

    io.to(assignedRoom).emit('updatePlayers', assignedRoom);

    if (rooms[assignedRoom].length === MAX_PLAYERS_PER_ROOM) {
      io.to(assignedRoom).emit('game:startGame');
    }
  });

  socket.on('game:updateState', ({ roomId, state }) => {
    if (!rooms[roomId] || rooms[roomId].length < MAX_PLAYERS_PER_ROOM) {
      return;
    }

    socket.to(roomId).emit('game:updateOpponentState', state);
  });

  socket.on('game:gameOver', () => {
    if(!rooms[assignedRoom]) {
      return;
    }

    io.to(assignedRoom).emit('game:gameOver', {
      winner: rooms[assignedRoom].find((id: string) => id !== socket.id),
      loser: socket.id,
    });
  });

  socket.on('game:gameEnd', () => {
    socket.emit('updatePlayers', null);
    socket.leave(assignedRoom);

    delete rooms[assignedRoom];
    assignedRoom = null;
  });

  socket.on('disconnect', () => {
    socket.to(assignedRoom).emit('game:playerDisconnected');
    socket.to(assignedRoom).emit('updatePlayers', null);
    io.socketsLeave(assignedRoom);

    delete rooms[assignedRoom];
    assignedRoom = null;
  });
};

export default gameHandler;