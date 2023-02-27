const oracledb = require('oracledb');
import { dbConfig, libDir } from '../config/dbConfig';

async function handleDatabaseInitiation() {
  await handleInitOracleClient();
  await handleCreateConnectionPool();
}

// oracle client 초기화
async function handleInitOracleClient() {
  try {
    await oracledb.initOracleClient({ libDir });
    // console.log('Initiate oracle client');
  } catch (e) {
    console.error('Error initiating oracle client: ', e);
    throw Error();
  }
}

// connection pool 생성
async function handleCreateConnectionPool() {
  try {
    await oracledb.createPool({
      ...dbConfig,
      poolMax: 20,
      poolMin: 5,
      poolIncrement: 10,
      poolTimeout: 60,
      poolAlias: 'default'
    });
    // console.log('Pool created.');
  } catch (e) {
    console.error('Error creating pool: ', e);
    throw Error();
  }
}

// connection 가져오기
async function handleGetConnection() {
  try {
    const connection = await oracledb.getConnection();
    console.log('Connection acquired.');
    return connection;
  } catch (e) {
    console.error('Error getting connection: ', e);
    throw Error();
  }
}

// sql 실행
async function handleSql(query: string, params: any): Promise<any> {
  const connection = await handleGetConnection();

  let binds = { ...params }; // 동적 쿼리 파라미터인듯
  let options = {
    autoCommit: true, // 자동 커밋
    outFormat: oracledb.OUT_FORMAT_OBJECT // 쿼리 결과 포맷 (json 객체 형식)
  };

  let result: any = null;

  try {
    console.log(`SQL - ${query}`);
    console.log(
      `Parameters - ${Object.entries(binds).map(([k, v]) => k + ':' + v)}`
    );
    result = await connection.execute(query, binds, options);
    console.log(`Total: ${result?.rows?.length}`);
  } catch (e) {
    console.log(e);
  }

  await handleReleaseConnection(connection);

  return result?.rows;
}

// connection pool 환원하기
async function handleReleaseConnection(connection: any) {
  try {
    connection.release();
    // console.log('Connection released.');
  } catch (e) {
    console.error('Error releasing connection: ', e);
    throw Error();
  }
}

// connection pool 종료하기
async function handleClosePoolAndExit() {
  console.log('\nTerminating');

  try {
    await oracledb.getPool().close();
    console.log('Pool closed.');
  } catch (e) {
    console.error('Error closing pool: ', e);
  }
}

// 프로세스 강제 종료시 connection pool도 종료
process
  .once('SIGTERM', handleClosePoolAndExit)
  .once('SIGINT', handleClosePoolAndExit);

export { handleDatabaseInitiation, handleSql };
