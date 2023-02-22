const cron = require('node-cron');
import { UPDATE_INITIATE_TOTAY_VISITHISTORY } from '../queries/update';
import { DELETE_ALL_VISITOR } from '../queries/delete';
import { sql } from '../modules/oracleSetting';

// 스케쥴러 한번에 export
export function startCrons() {
  initTodayVisitHistory.start();
}

// 매일 자정에 오늘 방문자 및 방문자 수 0으로 초기화
const initTodayVisitHistory = cron.schedule('0 0 0 * * *', function () {
  sql(UPDATE_INITIATE_TOTAY_VISITHISTORY, '');
  sql(DELETE_ALL_VISITOR, '');
});
