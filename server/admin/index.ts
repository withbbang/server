import { Router } from 'express';
import { authority } from './authority';
import { categoryManage } from './categoryManage';
import { contentManage } from './contentManage';

export const admin: Router = Router();

admin.use('/authority', authority);
admin.use('/category-manage', categoryManage);
admin.use('/content-manage', contentManage);
