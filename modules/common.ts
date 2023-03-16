// 라이브러리 임포트
import moment from 'moment-timezone';
import { Request, Response, NextFunction } from 'express';

// 모듈 임포트
import { handleSql } from './oracleSetting';
import { cookieConfigSecure } from '../config/config';
import { SELECT_VISITOR_IP } from '../queries/select';
import { INSERT_TODAY_VISITOR_IP } from '../queries/insert';
import { UPDATE_INCREMENT_VISITHISTORY } from '../queries/update';

/**
 * 금일 방문여부 체크 함수
 * @param {Request} req Http Request
 * @param {Response} res Http Response
 * @returns {Promise<any>}
 */
async function handleCheckTodayVisit(
  req: Request,
  res: Response
): Promise<any> {
  if (req.originalUrl.includes('/server')) {
    return;
  }

  const curr: string = handleGetLocaleTime();
  // cookieConfigSecure에서 signed: true일 경우 signedCookies로만 접근 가능
  const visitDate: string | undefined = req.signedCookies?.visitDate;

  if (!visitDate || moment(visitDate).isBefore(curr)) {
    // cookieConfigSecure에 따라 브라우져에 쿠키 설정
    res.cookie('visitDate', curr, cookieConfigSecure);

    const ip: string | string[] | undefined =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    let visitor = null;

    try {
      visitor = await handleSql(SELECT_VISITOR_IP({ ip }));
    } catch (e: any) {
      throw new Error(e.stack);
    }

    if (visitor?.length === 0) {
      try {
        handleSql(INSERT_TODAY_VISITOR_IP({ ip }));
        handleSql(UPDATE_INCREMENT_VISITHISTORY());
      } catch (e: any) {
        throw new Error(e.stack);
      }
    }
  }
}

/**
 * 현지 시간 계산 함수
 * @param {string} type 날짜 return할 날짜 포맷
 * @returns {string}
 */
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
  next && next(new Error(e.message));
  throw new Error(e.stack);
}

export { handleCheckTodayVisit, handleGetLocaleTime };
