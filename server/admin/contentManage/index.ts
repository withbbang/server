import { Router } from 'express';
import { contents } from './contents';
import { content } from './content';
import { createContent } from './createContent';

export const contentManage: Router = Router();

contentManage.use('/content', content);
contentManage.use('/contents', contents);
contentManage.use('/create-content', createContent);
