// 라이브러리 임포트
import cron from 'node-cron';

// 모듈 임포트
import {
  UPDATE_INITIATE_TOTAY_VISITHISTORY,
  DELETE_ALL_VISITOR
} from '../queries/common';
import { handleSql } from '../modules/oracleSetting';

/**
 * 매일 자정에 오늘 방문자 및 방문자 수 0으로 초기화하는 스케쥴러
 */
const initTodayVisitHistory: cron.ScheduledTask = cron.schedule(
  '0 0 0 * * *',
  function (): void {
    handleSql(UPDATE_INITIATE_TOTAY_VISITHISTORY());
    handleSql(DELETE_ALL_VISITOR());
  }
);

/**
 * 스케쥴러 한번에 export하는 함수
 */
export function handleStartCrons(): void {
  initTodayVisitHistory.start();
}
