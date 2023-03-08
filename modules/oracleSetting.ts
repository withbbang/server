import oracledb from 'oracledb';

(async function (): Promise<void> {
  handleInitOracleClient();
  await handleCreateConnectionPool();
})();

// oracle client 초기화
function handleInitOracleClient(): void {
  try {
    oracledb.initOracleClient({ libDir: process.env.libDir });
    // console.log('Initiate oracle client');
  } catch (e) {
    console.error(e);
    throw new Error('Initiating oracle client');
  }
}

// connection pool 생성
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
  } catch (e) {
    console.error(e);
    throw new Error('Creating pool');
  }
}

// connection 가져오기
async function handleGetConnection(): Promise<oracledb.Connection> {
  try {
    const connection: oracledb.Connection = await oracledb.getConnection();
    // throw new Error('test');
    // console.log('Connection acquired.');
    return connection;
  } catch (e) {
    console.error(e);
    throw new Error('Getting connection');
  }
}

// sql 실행
async function handleSql(
  query: string,
  params: undefined | any = undefined
): Promise<any> {
  let connection: oracledb.Connection | null = null;

  try {
    connection = await handleGetConnection();
  } catch (e) {
    console.error(e);
    throw new Error('Getting connection');
  }

  let binds = params ? { ...params } : {}; // 동적 쿼리 파라미터인듯
  let options = {
    autoCommit: true, // 자동 커밋
    outFormat: oracledb.OUT_FORMAT_OBJECT // 쿼리 결과 포맷 (json 객체 형식)
  };

  console.log(`SQL >>> ${query}`);
  binds.constructor === Object &&
    Object.keys(binds).length &&
    console.log(
      `Parameters >>> ${Object.entries(binds).map(([k, v]) => k + ':' + v)}`
    );

  let result: any = null;

  try {
    result = connection && (await connection.execute(query, binds, options));
  } catch (e) {
    console.error(e);
    throw new Error('Excutting sql');
  } finally {
    await handleReleaseConnection(connection);
  }

  typeof result?.rows?.length === 'number' &&
    console.log(`Total >>> ${result?.rows?.length}`);

  return result?.rows;
}

// connection pool 환원하기
async function handleReleaseConnection(
  connection: oracledb.Connection
): Promise<void> {
  try {
    await connection.release();
    // console.log('Connection released.');
  } catch (e) {
    console.error(e);
    throw new Error('Releasing connection');
  }
}

// connection pool 종료하기
async function handleClosePoolAndExit(): Promise<void> {
  console.log('\nTerminating');

  try {
    await oracledb.getPool().close();
    console.log('Pool closed.');
  } catch (e) {
    console.error(e);
    throw new Error('Closing pool');
  }
}

// 프로세스 강제 종료시 connection pool도 종료
process
  .once('SIGTERM', handleClosePoolAndExit)
  .once('SIGINT', handleClosePoolAndExit);

export { handleSql };
