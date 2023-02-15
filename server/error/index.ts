import { Request, Response, Router } from 'express';
import { view } from './view';
import { api } from './api';

export const error: Router = Router();

error.use('/view', view);
error.use('/api', api);

error.get('/', (req: Request, res: Response) => {
  res.json({ value: 'error' });
});
