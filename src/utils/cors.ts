import { Request } from 'express';

const whitelist = [
  // 'https://seamly-h5sc.onrender.com',
];

export const corsOptionsDelegate = (req: Request, callback) => {
  let corsOptions = {};

  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};
