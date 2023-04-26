function SELECT_VISIT_COUNT() {
  const query = `
        SELECT * FROM VISITHISTORY
    `;

  return { query };
}

function SELECT_CATEGORIES(params?: any) {
  // 구조분해 할당 먼저 선언하는 방법
  let id;
  params && ({ id } = params);

  const query = `
      SELECT
        TITLE
        , PATH
      FROM
        CATEGORY
      WHERE
        1 = 1
        AND IS_DELETED = 'N'
        AND AUTHORITY_AUTH >= ${
          id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
        }
      ORDER BY
        PRIORITY
    `;

  return { query, params };
}

function SELECT_CONTENTS(params?: any) {
  let id, path;
  params && ({ id, path } = params);

  const query = `
    SELECT
        CO.ID AS ID
        , CO.TITLE AS TITLE
        , SUBSTR(CO.CONTENT, 1, 300) AS CONTENT
        , CO.PATH AS PATH
    FROM
        CATEGORY CA
        JOIN CONTENTS CO ON CA.ID = CO.CATEGORY_ID
    WHERE
        1 = 1
        AND CA.IS_DELETED = 'N'
        AND CO.IS_DONE = 'Y'
        AND CO.IS_DELETED = 'N'
        AND AUTHORITY_AUTH >= ${
          id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
        }
        ${path ? 'AND CA.PATH = :path' : ''}
    ORDER BY
        CO.CREATE_DT DESC
    `;

  return { query, params };
}

function UPDATE_INCREMENT_VISITHISTORY(params?: any) {
  const query = `
    UPDATE
      VISITHISTORY
    SET
      TOTAL = TOTAL + 1
      , TODAY = TODAY + 1
`;

  return { query, params };
}

function INSERT_TODAY_VISITOR_IP(params?: any) {
  const { ip } = params;
  const query = `INSERT INTO VISITOR VALUES (:ip)`;

  return { query, params };
}

function UPDATE_INITIATE_TOTAY_VISITHISTORY(params?: any) {
  const query = `
    UPDATE
      VISITHISTORY
    SET
      TODAY = 0
`;

  return { query, params };
}

function DELETE_ALL_VISITOR(params?: any) {
  const query = `DELETE FROM VISITOR`;

  return { query, params };
}

function UPDATE_USER_ACCESS_TOKEN(params: any) {
  const { accessToken, id } = params;
  const query = `
    UPDATE
      USERS
    SET
      ACCESS_TOKEN = :accessToken
    WHERE
      ID = :id
  `;

  return { query, params };
}

function SELECT_VISITOR_IP(params?: any) {
  const { ip } = params;
  const query = `
    SELECT
        IP
    FROM
        VISITOR
    WHERE
        1 = 1
        ${ip ? 'AND IP = :ip' : ''}
  `;

  return { query, params };
}

function SELECT_USER(params?: any) {
  let id;
  params && ({ id } = params);

  const query = `
    SELECT
        ID
        , PASSWORD
        , SALT
        , ACCESS_TOKEN
        , REFRESH_TOKEN
        , AUTH
    FROM
        USERS
    WHERE
        1 = 1
        ${id ? 'AND ID = :id' : ''}
    `;

  return { query, params };
}

export {
  SELECT_VISIT_COUNT,
  SELECT_CATEGORIES,
  SELECT_CONTENTS,
  UPDATE_INCREMENT_VISITHISTORY,
  INSERT_TODAY_VISITOR_IP,
  UPDATE_INITIATE_TOTAY_VISITHISTORY,
  DELETE_ALL_VISITOR,
  UPDATE_USER_ACCESS_TOKEN,
  SELECT_VISITOR_IP,
  SELECT_USER
};
