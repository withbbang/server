import { Router } from 'express';
import { contents } from './contents';

export const contentManage: Router = Router();

contentManage.use('/contents', contents);
