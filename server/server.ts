import { Request, Response, Router } from 'express';
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
