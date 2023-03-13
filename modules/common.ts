// 라이브러리 임포트
import moment from 'moment-timezone';
import { Request, Response, NextFunction } from 'express';

// 모듈 임포트
import { handleSql } from './oracleSetting';
import { cookieConfig } from '../config/config';
import { SELECT_VISITOR_IP } from '../queries/select';
import { INSERT_TODAY_VISITOR_IP } from '../queries/insert';
import { UPDATE_INCREMENT_VISITHISTORY } from '../queries/update';

// 금일 방문 여부 체크
async function handleCheckTodayVisit(
  req: Request,
  res: Response
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
      console.error(e);
      throw new Error(e);
    }

    if (visitor?.length === 0) {
      try {
        handleSql(INSERT_TODAY_VISITOR_IP, { ip });
        handleSql(UPDATE_INCREMENT_VISITHISTORY);
      } catch (e: any) {
        console.error(e);
        throw new Error(e);
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

// catch 절 함수
function handleCatchClause(
  e: any,
  next: NextFunction | undefined = undefined
): void {
  // console.error(e);
  next && next(new Error(e.message));
  throw new Error(e);
}

export { handleCheckTodayVisit, handleGetLocaleTime };
