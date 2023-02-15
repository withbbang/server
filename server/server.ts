import { Request, Response, Router } from 'express';
import { a } from './a';
import { b } from './b';
import { error } from './error';

export const server: Router = Router();

server.use('/a', a);
server.use('/b', b);
server.use('/error', error);

server.get('/', (req: Request, res: Response) => {
  res.json({ value: 'server' });
});
