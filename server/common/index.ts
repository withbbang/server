import { Request, Response, Router } from 'express';
import { publicKey } from '../../modules/crypto';
import { Results } from '../../enums/Results';
import { visitCount } from './visitCount';

export const common: Router = Router();

/**
 * 공개키 요청
 */
common.get('/public-key', function (req: Request, res: Response): void {
  res.json({ ...Results[0], publicKey });
});

common.use('/visit-count', visitCount);
