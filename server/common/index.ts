// 라이브러리 임포트
import { Request, Response, Router } from 'express';

// 모듈 임포트
import { publicKey } from '../../modules/crypto';
import { Results } from '../../enums/Results';
import { visitCount } from './visitCount';
import { categories } from './categories';
import { contents } from './contents';
import { searchContents } from './searchContents';

export const common: Router = Router();

/**
 * 공개키 요청
 */
common.get('/public-key', function (req: Request, res: Response): void {
  res.json({ ...Results[0], publicKey });
});

common.use('/visit-count', visitCount);
common.use('/categories', categories);
common.use('/contents', contents);
common.use('/search-contents', searchContents);
