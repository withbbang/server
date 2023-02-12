import { Request, Response, Router } from 'express';
import { a } from './a';
import { b } from './b';

export const server: Router = Router();

server.use('/a', a);
server.use('/b', b);

server.get('/', (req: Request, res: Response) => {
  res.json({ value: 'server' });
});
