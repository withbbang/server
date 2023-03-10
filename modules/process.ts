import { handleClosePoolAndExit } from './oracleSetting';

// process 함수 모음
export const handleProcess = function () {
  // promise 에러 추적
  process.on('unhandledRejection', (error: any, promise: Promise<unknown>) => {
    console.log('================= UNHANDLED REJECTION =================');
    console.log(error);
  });

  // 프로세스 강제 종료시 connection pool도 종료
  process
    .once('SIGTERM', handleClosePoolAndExit)
    .once('SIGINT', handleClosePoolAndExit);
};
