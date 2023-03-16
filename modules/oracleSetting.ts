import oracledb from 'oracledb';
import { SqlFuncType } from '../types/SqlFuncType';

/**
 * DB 초기화 IIEF
 */
(async function (): Promise<void> {
  handleInitOracleClient();
  await handleCreateConnectionPool();
})();

/**
 * oracle client 초기화
 */
function handleInitOracleClient(): void {
  try {
    oracledb.initOracleClient({ libDir: process.env.libDir });
    // console.log('Initiate oracle client');
  } catch (e: any) {
    throw new Error(e.stack);
  }
}

/**
 * connection pool 생성
 */
async function handleCreateConnectionPool(): Promise<void> {
  try {
    await oracledb.createPool({
      user: process.env.user,
      password: process.env.password,
      connectString: process.env.connectString,
      poolMax: 20,
      poolMin: 5,
      poolIncrement: 10,
      poolTimeout: 60,
      poolAlias: 'default'
    });
    // console.log('Pool created.');
  } catch (e: any) {
    throw new Error(e.stack);
  }
}

// connection 가져오기
async function handleGetConnection(): Promise<oracledb.Connection | undefined> {
  // throw new Error('test');
  try {
    const connection: oracledb.Connection = await oracledb.getConnection();
    // console.log('Connection acquired.');
    return connection;
  } catch (e: any) {
    throw new Error(e.stack);
  }
}

/**
 * SQL 실행 함수
 * @param {string} query 쿼리
 * @param {undefined | any} params 동적 파라미터
 * @returns {Promise<any>}
 */
async function handleSql({ query, params }: SqlFuncType): Promise<any> {
  let connection: oracledb.Connection | null | undefined = null;

  try {
    connection = await handleGetConnection();
  } catch (e: any) {
    throw new Error(e.stack);
  }

  const binds = params ? { ...params } : {}; // 동적 쿼리 파라미터인듯
  const options = {
    autoCommit: true, // 자동 커밋
    outFormat: oracledb.OUT_FORMAT_OBJECT // 쿼리 결과 포맷 (json 객체 형식)
  };

  for (let id in binds) {
    if (binds[id] === undefined) delete binds[id];
  }

  console.log(`SQL >>> ${query}`);
  binds.constructor === Object &&
    Object.keys(binds).length &&
    console.log(
      `Parameters >>> ${Object.entries(binds).map(([k, v]) => k + ':' + v)}`
    );

  let result: any = null;

  try {
    result = connection && (await connection.execute(query, binds, options));
  } catch (e: any) {
    throw new Error(e.stack);
  } finally {
    await handleReleaseConnection(connection);
  }

  typeof result?.rows?.length === 'number' &&
    console.log(`Total >>> ${result?.rows?.length}`);

  return result?.rows;
}

/**
 * Connection Pool 환원 함수
 * @param {oracledb.Connection | null | undefined} connection
 */
async function handleReleaseConnection(
  connection: oracledb.Connection | null | undefined
): Promise<void> {
  try {
    await connection?.release();
    // console.log('Connection released.');
  } catch (e: any) {
    throw new Error(e.stack);
  }
}

/**
 * Connection Pool 종료하기
 */
async function handleClosePoolAndExit(): Promise<void> {
  console.log('\nTerminating');

  try {
    await oracledb.getPool().close();
    console.log('Pool closed.');
  } catch (e: any) {
    throw new Error(e.stack);
  }
}

export { handleSql, handleClosePoolAndExit };
