import { Router } from 'express';
import { categories } from './categories';
import { createCategory } from './createCategory';
import { singleUpdateCategory } from './singleUpdateCategory';
import { multiupdateCategory } from './multiUpdateCategory';

export const categoryManage: Router = Router();

categoryManage.use('/categories', categories);
categoryManage.use('/create', createCategory);
categoryManage.use('/single-update', singleUpdateCategory);
categoryManage.use('/multi-update', multiupdateCategory);
