import express, { Request, Response } from 'express';
import { logger } from './config/winston';
import { dbConfig } from './config/dbConfig';
const oracledb = require('oracledb');
const app = express();
const cors = require('cors');
const path = require('path');

// 라우터 임포트
import { server } from './server/server';

const PORT = process.env.PORT || 3001;

(async () => {
  await oracledb.initOracleClient({
    libDir:
      'C:\\Users\\82107\\WorkSpace\\instantclient-basic-windows.x64-21.9.0.0.0dbru\\instantclient_21_9'
  });

  let connection = null;

  try {
    console.log('!!!!! ready to db conenction !!!!!');
    connection = await oracledb.getConnection(dbConfig);
  } catch (e) {
    console.log(e);
    throw new Error();
  }

  let binds = {};
  let options = {
    outFormat: oracledb.OUT_FORMAT_OBJECT // query result format
  };

  let result = null;
  try {
    result = await connection.execute(
      'SELECT * FROM VISITHISTORY',
      binds,
      options
    );
  } catch (e) {
    console.log(e);
  }

  console.log('!!!!! db response !!!!!');
  console.log(result.rows[0]);

  console.log('!!!!! db close !!!!!');
  try {
    await connection.close();
  } catch (e) {
    console.log(e);
  }
})();

// 라우터들 사용
app.use('/server', server);

app.use(express.static(path.join(__dirname, './views'))); // 정적파일 디렉터리 설정
app.use(cors()); // cors 설정

// 데이터 요청 api는 정적 소스 라우팅보다 우선 선언해야함
app.get('/test', (req: Request, res: Response) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(ip);
  // logger.info('GET /');
  // logger.error('Error message');
  res.json({ value: 'hello' });
});

// 정적 소스 라우팅은 react build 파일에 일임한다는 뜻. 무조건 마지막에 처리해야함
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, './views/index.html'));
});

app.listen(PORT, () => console.log(`server is running on ${PORT}...`));
