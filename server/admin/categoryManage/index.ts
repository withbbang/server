import { Router } from 'express';
import { categories } from './categories';
import { createCategory } from './createCategory';
import { updateCategory } from './updateCategory';

export const categoryManage: Router = Router();

categoryManage.use('/categories', categories);
categoryManage.use('/create', createCategory);
categoryManage.use('/update', updateCategory);
