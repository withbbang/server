import { Request, Response, Router } from 'express';

export const view: Router = Router();

view.get('/', (req: Request, res: Response) => {
  res.json({ value: 'view' });
});
