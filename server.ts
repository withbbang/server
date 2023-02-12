import express, { Request, Response } from 'express';
const app = express();
const cors = require('cors');
const path = require('path');

// 라우터 임포트
import { server } from './server/server';

const PORT = process.env.PORT || 3001;

// 라우터들 사용
app.use('/server', server);

app.use(express.static(path.join(__dirname, './views'))); // 정적파일 디렉터리 설정
app.use(cors()); // cors 설정

// 데이터 요청 api는 정적 소스 라우팅보다 우선 선언해야함
app.get('/test', (req: Request, res: Response) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(ip);
  res.json({ value: 'hello' });
});

// 정적 소스 라우팅은 react build 파일에 일임한다는 뜻. 무조건 마지막에 처리해야함
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, './views/index.html'));
});

app.listen(PORT, () => console.log('server is running...'));
