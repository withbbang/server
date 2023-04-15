// 라이브러리 임포트
import { Router } from 'express';

// 모듈 임포트
import { signUp } from './signUp';
import { signOut } from './signOut';

export const sign: Router = Router();

sign.use('/up', signUp);
sign.use('/out', signOut);
