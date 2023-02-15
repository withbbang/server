import { Request, Response, Router } from 'express';

export const api: Router = Router();

api.get('/', (req: Request, res: Response) => {
  res.json({ value: 'api' });
});
