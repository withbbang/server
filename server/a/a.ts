import { Request, Response, Router } from 'express';

export const a: Router = Router();

a.get('/', (req: Request, res: Response) => {
  res.json({ value: 'a' });
});
