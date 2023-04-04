import { Router } from 'express';
import { categoryManage } from './categoryManage';
import { authority } from './authority';

export const admin: Router = Router();

admin.use('/category-manage', categoryManage);
admin.use('/authority', authority);
