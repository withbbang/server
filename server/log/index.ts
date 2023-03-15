import { Request, Response, Router } from 'express';
import { logIn } from './logIn';
import { logOut } from './logOut';
import { publicKey } from '../../modules/crypto';
import { Results } from '../../enums/Results';

export const log: Router = Router();

log.get('/', function (req: Request, res: Response): void {
  res.json({ ...Results[0], publicKey });
});

log.use('/in', logIn);
log.use('/out', logOut);
