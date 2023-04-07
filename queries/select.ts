function SELECT_VISITOR_IP(params: any) {
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

function SELECT_USER(params: any) {
  const { id, accessToken, refreshToken } = params;
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
        ${accessToken ? 'AND ACCESS_TOKEN = :accessToken' : ''}
        ${refreshToken ? 'AND REFRESH_TOKEN = :refreshToken' : ''}
  `;

  return { query, params };
}

function SELECT_ALL_CATEGORIES() {
  const query = `
    SELECT
      CA.ID AS ID
      , CA.TITLE AS TITLE
      , CA.PRIORITY AS PRIORITY
      , CA.PATH AS PATH
      , AUTH.DESCRIPTION AS DESCRIPTION
      , IS_DELETED AS IS_DELETED
      , AUTH.AUTH AS AUTH
    FROM
      CATEGORY CA
      JOIN AUTHORITY AUTH ON CA.AUTHORITY_AUTH = AUTH.AUTH
    ORDER BY
      CA.PRIORITY
  `;

  return { query };
}

function SELECT_CATEGORIES(params?: any) {
  // 구조분해 할당 먼저 선언하는 방법
  let title, id, categoryId, isDeleted;
  params && ({ title, id, categoryId, isDeleted } = params);

  const query = `
    SELECT
      CA.ID AS ID
      , CA.TITLE AS TITLE
      , CA.PRIORITY AS PRIORITY
      , CA.PATH AS PATH
      , AUTH.DESCRIPTION AS DESCRIPTION
      , CA.IS_DELETED AS IS_DELETED
      , AUTH.AUTH AS AUTH
    FROM
      CATEGORY CA
      JOIN AUTHORITY AUTH ON CA.AUTHORITY_AUTH = AUTH.AUTH
    WHERE
      1 = 1
      AND CA.IS_DELETED = ${isDeleted ? ':isDeleted' : "'N'"}
      ${title ? 'AND CA.TITLE = :title' : ''}
      AND CA.AUTHORITY_AUTH >= ${
        id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
      }
      ${categoryId ? 'AND CA.ID = :categoryId' : ''}
    ORDER BY
      CA.PRIORITY
  `;

  return { query, params };
}

function SELECT_VISIT_COUNT() {
  const query = `
    SELECT * FROM VISITHISTORY
  `;

  return { query };
}

function SELECT_CONTENTS(params?: any) {
  const { path, id } = params;
  const query = `
    SELECT
      CO.ID AS ID
      , CO.TITLE AS TITLE
      , UTL_RAW.CAST_TO_VARCHAR2(DBMS_LOB.SUBSTR(CO.CONTENT, 3200, 1)) AS CONTENT
      , CO.PATH AS PATH
    FROM
      CATEGORY CA
      JOIN CONTENTS CO ON CA.ID = CO.CATEGORY_ID
    WHERE
      1 = 1
      AND CO.IS_DONE = 'Y'
      AND CO.IS_DELETED = 'N'
      ${path ? 'AND CA.PATH = :path' : ''}
      AND AUTHORITY_AUTH >= ${
        id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
      }
    ORDER BY
      CO.CREATE_DT DESC
  `;

  return { query, params };
}

function SELECT_AUTHORITY() {
  const query = `
    SELECT AUTH, DESCRIPTION FROM AUTHORITY WHERE AUTH < 30 ORDER BY AUTH DESC
  `;

  return { query };
}

export {
  SELECT_VISITOR_IP,
  SELECT_USER,
  SELECT_ALL_CATEGORIES,
  SELECT_CATEGORIES,
  SELECT_VISIT_COUNT,
  SELECT_CONTENTS,
  SELECT_AUTHORITY
};
