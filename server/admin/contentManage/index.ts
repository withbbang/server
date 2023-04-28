// 라이브러리 임포트
import { Router } from 'express';

// 모듈 임포트
import { contents } from './contents';
import { content } from './content';
import { createContent } from './createContent';
import { deleteRestoreContent } from './deleteRestoreContent';
import { updateContent } from './updateContent';

export const contentManage: Router = Router();

contentManage.use('/content', content);
contentManage.use('/contents', contents);
contentManage.use('/create-content', createContent);
contentManage.use('/delete-restore', deleteRestoreContent);
contentManage.use('/update-content', updateContent);
