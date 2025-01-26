import { Request, Response } from 'express';
import StatusCodes from 'http-status-codes';

const notFound = (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).send('路由不存在');
};

export default notFound;