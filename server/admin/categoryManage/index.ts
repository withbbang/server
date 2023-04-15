// 라이브러리 임포트
import { Router } from 'express';

// 모듈 임포트
import { categories } from './categories';
import { createCategory } from './createCategory';
import { singleUpdateCategory } from './singleUpdateCategory';
import { multiupdateCategory } from './multiUpdateCategory';
import { deleteRestoreCategory } from './deleteRestoreCategory';

export const categoryManage: Router = Router();

categoryManage.use('/categories', categories);
categoryManage.use('/create', createCategory);
categoryManage.use('/single-update', singleUpdateCategory);
categoryManage.use('/multi-update', multiupdateCategory);
categoryManage.use('/delete-restore', deleteRestoreCategory);
