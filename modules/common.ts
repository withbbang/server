import moment from 'moment-timezone';
import { handleSql } from '../modules/oracleSetting';
import { SELECT_VISITOR_IP } from '../queries/select';
import { INSERT_TODAY_VISITOR_IP } from '../queries/insert';
import { UPDATE_INCREMENT_VISITHISTORY } from '../queries/update';

// export async function checkTodayVisit(
//   ip: string | string[] | undefined,
//   visitDate: string | undefined,
//   res: Response
// ): Promise<any> {
//   const curr: string = getLocaleTime();
//   const visitor = await handleSql(SELECT_VISITOR_IP, { ip });

//   if (
//     (!visitDate || moment(visitDate).isBefore(curr)) &&
//     visitor?.length === 0
//   ) {
//     res.cookie('visitDate', curr, cookieConfig); // cookieConfig에 따라 브라우져에 쿠키 설정
//     handleSql(INSERT_TODAY_VISITOR_IP, { ip });
//     handleSql(UPDATE_INCREMENT_VISITHISTORY, '');
//   }
// }

// 금일 방문 여부 체크
export async function handleCheckTodayVisit(
  ip: string | string[] | undefined
): Promise<any> {
  const visitor = await handleSql(SELECT_VISITOR_IP, { ip });

  if (visitor?.length === 0) {
    handleSql(INSERT_TODAY_VISITOR_IP, { ip });
    handleSql(UPDATE_INCREMENT_VISITHISTORY, '');
  }
}

// 현지 시간 계산
export function handleGetLocaleTime(): string {
  return moment().tz('Asia/Seoul').format('YYYY-MM-DD');
}
