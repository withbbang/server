import { Router } from 'express';
import { adminInfo } from './adminInfo';
import { categoryManage } from './categoryManage';

export const admin: Router = Router();

admin.use('/info', adminInfo);
admin.use('/category-manage', categoryManage);
