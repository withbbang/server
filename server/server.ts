// 라이브러리 임포트
import { Request, Response, Router } from 'express';

// 모듈 임포트
import { a } from './a';
import { sign } from './sign';
import { error } from './error';

export const server: Router = Router();

server.use('/a', a);
server.use('/sign', sign);
server.use('/error', error);

server.get('/', (req: Request, res: Response) => {
  res.json({ value: 'server' });
});
