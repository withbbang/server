// 라이브러리 임포트
import { Router } from 'express';

// 모듈 임포트
import { logIn } from './logIn';
import { logOut } from './logOut';

export const log: Router = Router();

log.use('/in', logIn);
log.use('/out', logOut);
