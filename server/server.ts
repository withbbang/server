// 라이브러리 임포트
import { Router } from 'express';

// 모듈 임포트
import { log } from './log';
import { sign } from './sign';
import { admin } from './admin';
import { error } from './error';
import { verifyAccessToken, verifyRefreshToken } from '../modules/jwt';

export const server: Router = Router();

server.use('/log', log);
server.use('/sign', sign);
server.use('/admin', verifyAccessToken, verifyRefreshToken, admin);
server.use('/error', error);
