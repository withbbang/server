import { Router } from 'express';
import { categoryManage } from './categoryManage';

export const admin: Router = Router();

admin.use('/category-manage', categoryManage);
