import StatusCodes from 'http-status-codes';
import CustomAPIError from './customAPI.js';

class NotFoundError extends CustomAPIError {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

export default NotFoundError;