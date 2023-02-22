import express, { Request, Response } from 'express';
import { logger } from './config/winston';
import { checkTodayVisit } from './modules/common';
import { databaseInitiation } from './modules/oracleSetting';
import { startCrons } from './modules/cron';
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const path = require('path');

// 라우터 임포트
import { server } from './server/server';

const PORT = process.env.PORT || 3001;

app.use('/server', server); // 라우터들 사용
app.use(cookieParser('secret')); // cookieParser(secretKey, optionObj)
app.use(express.static(path.join(__dirname, './views'))); // 정적파일 디렉터리 설정
app.use(cors()); // cors 설정

databaseInitiation();
startCrons();

// 데이터 요청 api는 정적 소스 라우팅보다 우선 선언해야함
app.get('/test', (req: Request, res: Response) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(ip);
  // logger.info('GET /');
  // logger.error('Error message');
  res.json({ value: 'hello' });
});

// 정적 소스 라우팅은 react build 파일에 일임한다는 뜻. 무조건 마지막에 처리해야 모든 url 요청에서 받을 수 있음
app.get('*', async (req: Request, res: Response) => {
  await checkTodayVisit(
    req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    req.signedCookies.visitDate,
    res
  );

  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => console.log(`server is running on ${PORT}...`));
