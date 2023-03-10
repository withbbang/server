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
  } catch (e: any) {
    throw new Error(e.stack);
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

// sql 실행
async function handleSql(
  query: string,
  params: undefined | any = undefined
): Promise<any> {
  let connection: oracledb.Connection | null | undefined = null;

  try {
    connection = await handleGetConnection();
  } catch (e: any) {
    throw new Error(e.stack);
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
  } catch (e: any) {
    throw new Error(e.stack);
  } finally {
    await handleReleaseConnection(connection);
  }

  typeof result?.rows?.length === 'number' &&
    console.log(`Total >>> ${result?.rows?.length}`);

  return result?.rows;
}

// connection pool 환원하기
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

// connection pool 종료하기
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
