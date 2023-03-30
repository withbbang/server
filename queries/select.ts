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
      ID
      , TITLE
      , PRIORITY
    FROM
      CATEGORY
    ORDER BY
      PRIORITY ASC
  `;

  return { query };
}

function SELECT_CATEGORIES(params?: any) {
  const { title, id } = params;
  const query = `
    SELECT
      ID
      , TITLE
      , PRIORITY
    FROM
      CATEGORY
    WHERE
      1 = 1
      AND IS_DELETED = 'N'
      ${title ? 'AND TITLE = :title' : ''}
      AND AUTHORITY_AUTH >= ${
        id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
      }
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
  const { title, id } = params;
  const query = `
    SELECT
      CO.ID
      , CO.TITLE AS CONTENT_TITLE
      , CA.TITLE AS CATEGORY_TITLE
      , UTL_RAW.CAST_TO_VARCHAR2(DBMS_LOB.SUBSTR(CO.CONTENT, 3200, 1)) AS CONTENT
      , PATH
    FROM
      CATEGORY CA
      JOIN CONTENTS CO ON CA.ID = CO.CATEGORY_ID
    WHERE
      1 = 1
      AND CO.IS_DONE = 'Y'
      AND CO.IS_DELETED = 'N'
      ${title ? 'AND CA.TITLE = :title' : ''}
      AND AUTHORITY_AUTH >= ${
        id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
      }
    ORDER BY
      CO.CREATE_DT DESC
  `;

  return { query, params };
}

export {
  SELECT_VISITOR_IP,
  SELECT_USER,
  SELECT_ALL_CATEGORIES,
  SELECT_CATEGORIES,
  SELECT_VISIT_COUNT,
  SELECT_CONTENTS
};
