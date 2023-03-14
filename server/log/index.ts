import { Request, Response, Router } from 'express';
import { logIn } from './logIn';
import { logOut } from './logOut';
import { publicKey } from '../../modules/crypto';

export const log: Router = Router();

log.get('/', function (req: Request, res: Response): void {
  res.json({ publicKey });
});

log.use('/in', logIn);
log.use('/out', logOut);
