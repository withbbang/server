import { Request, Response, Router } from 'express';

export const b: Router = Router();

b.get('/', (req: Request, res: Response) => {
  res.json({ value: 'b' });
});
