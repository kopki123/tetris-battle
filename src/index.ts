import 'express-async-errors';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import history from 'connect-history-api-fallback';
import { Server } from 'socket.io';
import errorHandlerMiddleware from './middleware/errorHandler.js';
import notFoundMiddleware from './middleware/notFound.js';
import { corsOptionsDelegate } from './utils/cors.js';
import socketHandler from './socket/index.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
socketHandler(io);

// Client
if(process.env.NODE_ENV === 'production') {
  app.use(history());
  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  app.use(express.static(path.join(__dirname, '../public')));

  app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public'));
  });
}

// Middlewares
app.use(helmet());
app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  console.log('hello');
  res.send('hello');
});

// Middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();