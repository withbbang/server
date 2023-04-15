// 라이브러리 임포트
import { Router } from 'express';

// 모듈 임포트
import { authority } from './authority';
import { categoryManage } from './categoryManage';
import { contentManage } from './contentManage';

export const admin: Router = Router();

admin.use('/authority', authority);
admin.use('/category-manage', categoryManage);
admin.use('/content-manage', contentManage);
