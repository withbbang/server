// 라이브러리 임포트
import { Router } from 'express';

// 모듈 임포트
import { log } from './log';
import { sign } from './sign';
import { admin } from './admin';
import { common } from './common';
import { force } from './force';
import { content } from './content';
import { error } from './error';
import {
  handleVerifyATKMiddleware,
  handleVerifyRTKMiddleware
} from '../modules/middleware';

export const server: Router = Router();

server.use('/log', log);
server.use('/sign', sign);
server.use(
  '/admin',
  handleVerifyATKMiddleware,
  handleVerifyRTKMiddleware,
  admin
);
server.use('/common', common);
server.use('/force', force);
server.use('/contents', content);
server.use('/error', error);
