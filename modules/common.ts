// 라이브러리 임포트
import moment from 'moment-timezone';
import cookieParser from 'cookie-parser';
import express, {
  Express,
  Router,
  Request,
  Response,
  NextFunction
} from 'express';

// 모듈 임포트
import { handleSql } from './oracleSetting';
import { cookieConfig } from '../config/config';
import { SELECT_VISITOR_IP } from '../queries/select';
import { INSERT_TODAY_VISITOR_IP } from '../queries/insert';
import { UPDATE_INCREMENT_VISITHISTORY } from '../queries/update';

// 금일 방문 여부 체크
async function handleCheckTodayVisit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  if (req.originalUrl.includes('/server')) {
    return;
  }

  const curr: string = handleGetLocaleTime();
  const visitDate: string | undefined = req.signedCookies?.visitDate; // cookieConfig에서 secure: true일 경우 signedCookies로만 접근 가능

  if (!visitDate || moment(visitDate).isBefore(curr)) {
    res.cookie('visitDate', curr, cookieConfig); // cookieConfig에 따라 브라우져에 쿠키 설정

    const ip: string | string[] | undefined =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    let visitor = null;

    try {
      visitor = await handleSql(SELECT_VISITOR_IP, { ip });
    } catch (e: any) {
      handleCatchClause('Y', e, e.message, next);
    }

    if (visitor?.length === 0) {
      try {
        handleSql(INSERT_TODAY_VISITOR_IP, { ip });
        handleSql(UPDATE_INCREMENT_VISITHISTORY);
      } catch (e: any) {
        handleCatchClause('Y', e, e.message, next);
      }
    }
  }
}

// 현지 시간 계산
function handleGetLocaleTime(type: string = 'date'): string {
  if (type === 'date') return moment().tz('Asia/Seoul').format('YYYY-MM-DD');
  else if (type === 'db')
    return moment().tz('Asia/Seoul').format('YYYYMMDDHHmmss');
  else return moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
}

// body parser 및 cookie parser 세팅 함수
function handleSetParser(app: Express | Router): void {
  app.use(cookieParser(process.env.cookieKey)); // cookieParser(secretKey, optionObj)
  app.use(express.urlencoded({ extended: true })); // content-type이 application/x-www-form-urlencoded일 경우 파싱
  app.use(express.json()); // content-type이 application/json일 경우 파싱
}

function handleSetMiddleware(app: Express | Router): void {
  app.use(function (req: Request, res: Response, next: NextFunction) {
    console.log('req: reqreqreq');
    console.log('res: resresres');
    next();
  });
}

// error middleware 설정
function handleErrorMiddleware(app: Express | Router): void {
  app.use(function (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): express.Response<any, Record<string, any>> | undefined {
    console.error(err);

    if (req.originalUrl.includes('/server')) {
      return res.json({ error: 'Error Occur!' });
    } else return;
  });
}

function handleCatchClause(
  origin: string | undefined,
  e: any,
  message: string | undefined,
  next: NextFunction | undefined = undefined
): void {
  if (origin === 'Y') {
    console.error(e);
    throw new Error(message);
  } else {
    console.error(e);
    return next && next(new Error(e.message));
  }
}

export {
  handleCheckTodayVisit,
  handleGetLocaleTime,
  handleSetParser,
  handleSetMiddleware,
  handleErrorMiddleware,
  handleCatchClause
};
