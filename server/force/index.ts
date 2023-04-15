// 라이브러리 임포트
import { Router } from 'express';

// 모듈 임포트
import { logOut } from './logOut';

export const force: Router = Router();

force.use('/log-out', logOut);
