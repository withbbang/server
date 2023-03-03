import oracledb from 'oracledb';

async function handleDatabaseInitiation(): Promise<void> {
  handleInitOracleClient();
  await handleCreateConnectionPool();
}

// oracle client 초기화
function handleInitOracleClient(): void {
  try {
    oracledb.initOracleClient({ libDir: process.env.livDir });
    // console.log('Initiate oracle client');
  } catch (e) {
    console.error('Error initiating oracle client: ', e);
    throw Error();
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
    console.error('Error creating pool: ', e);
    throw Error();
  }
}

// connection 가져오기
async function handleGetConnection(): Promise<oracledb.Connection> {
  try {
    const connection: oracledb.Connection = await oracledb.getConnection();
    console.log('Connection acquired.');
    return connection;
  } catch (e) {
    console.error('Error getting connection: ', e);
    throw Error();
  }
}

// sql 실행
async function handleSql(
  query: string,
  params: undefined | any = undefined
): Promise<any> {
  const connection: oracledb.Connection = await handleGetConnection();

  console.log(params);

  let binds = params ? { ...params } : {}; // 동적 쿼리 파라미터인듯
  let options = {
    autoCommit: true, // 자동 커밋
    outFormat: oracledb.OUT_FORMAT_OBJECT // 쿼리 결과 포맷 (json 객체 형식)
  };

  let result: any = null;

  try {
    console.log(`SQL >>> ${query}`);
    binds &&
      console.log(
        `Parameters >>> ${Object.entries(binds).map(([k, v]) => k + ':' + v)}`
      );
    result = await connection.execute(query, binds, options);
    console.log(`Total >>> ${result?.rows?.length}`);
  } catch (e) {
    console.log('Error excutting sql: ', e);
    throw Error();
  } finally {
    await handleReleaseConnection(connection);
  }

  return result?.rows;
}

// connection pool 환원하기
async function handleReleaseConnection(connection: any): Promise<void> {
  try {
    connection.release();
    // console.log('Connection released.');
  } catch (e) {
    console.error('Error releasing connection: ', e);
    throw Error();
  }
}

// connection pool 종료하기
async function handleClosePoolAndExit(): Promise<void> {
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
