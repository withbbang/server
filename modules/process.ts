// 모듈 임포트
import { handleClosePoolAndExit } from './oracleSetting';

/**
 * process 처리 함수 모음
 */
export const handleProcess = function () {
  // promise 에러 추적
  process.on('unhandledRejection', (error: any, promise: Promise<unknown>) => {
    console.log('================= UNHANDLED REJECTION =================');
    console.log(error);
  });

  /**
   * 프로세스 강제 종료시 Connection Pool도 종료
   */
  process
    .once('SIGTERM', handleClosePoolAndExit)
    .once('SIGINT', handleClosePoolAndExit);
};
