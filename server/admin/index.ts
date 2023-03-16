import { Router } from 'express';
import { adminInfo } from './adminInfo';

export const admin: Router = Router();

admin.use('/info', adminInfo);
