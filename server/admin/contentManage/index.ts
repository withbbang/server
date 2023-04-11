import { Router } from 'express';
import { contents } from './contents';
import { content } from './content';

export const contentManage: Router = Router();

contentManage.use('/content', content);
contentManage.use('/contents', contents);
