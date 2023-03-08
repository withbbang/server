// 라이브러리 임포트
import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

// 환경변수 임포트
dotenv.config();

// 모듈 임포트
import {
  handleCheckTodayVisit,
  handleSetParser,
  handleErrorMiddleware
} from './modules/common';
import { handleStartCrons } from './modules/cron';
import { logger } from './config/winston';

// 라우터 임포트
import { server } from './server/server';

const PORT: string | 3001 = process.env.PORT || 3001;
const app: Express = express();

handleStartCrons();

handleSetParser(app);
app.use(cors()); // cors 설정
app.use('/server', server); // 라우터들 사용
app.use(express.static(path.join(__dirname, './views'))); // 정적파일 디렉터리 설정

// 데이터 요청 api는 정적 소스 라우팅보다 우선 선언해야함
app.get(
  '/error',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      await handleCheckTodayVisit(req, res, next);
      res.json({ error: 'Not Error Occur!' });
    } catch (err: any) {
      console.error(err);
      next(new Error(err.message));
      return;
    }
  }
);

// 정적 소스 라우팅은 react build 파일에 일임한다는 뜻. 무조건 마지막에 처리해야 모든 url 요청에서 받을 수 있음
app.get(
  '*',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    // logger.info('GET /');
    // logger.error('Error message');
    res.sendFile(path.join(__dirname, 'views', 'index.html'));

    try {
      await handleCheckTodayVisit(req, res, next);
    } catch (err: any) {
      console.error(err);
      next(new Error(err.message));
    }
  }
);

handleErrorMiddleware(app);

app.listen(PORT, function (): void {
  console.log(`server is running on ${PORT}...`);
});
