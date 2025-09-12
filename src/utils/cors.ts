import { Request } from 'express';

const whitelist = [];

export const corsOptionsDelegate = (req: Request, callback) => {
  let corsOptions = {};

  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};
