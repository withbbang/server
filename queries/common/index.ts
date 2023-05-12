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
        , NVL(CO.PATH, CA.PATH || '/' || CO.ID) AS PATH
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
  let ip;
  params && ({ ip } = params);

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
  let accessToken, id;
  params && ({ accessToken, id } = params);

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
  let ip;
  params && ({ ip } = params);

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

function SELECT_CONTENTS_FOR_SEARCHING(params?: any) {
  let snippet, id;
  params && ({ snippet, id } = params);

  const query = `
    SELECT
      CO.ID
      , CO.TITLE
      , SUBSTR(CO.CONTENT, INSTR(CO.CONTENT, :snippet), 200) AS CONTENT
      , NVL(CO.PATH, CA.PATH || '/' || CO.ID) AS PATH
    FROM
      CONTENTS CO
      JOIN CATEGORY CA ON CO.CATEGORY_ID = CA.ID
    WHERE
      CO.IS_DELETED = 'N'
      AND CO.IS_DONE = 'Y'
      AND CA.AUTHORITY_AUTH >= ${
        id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
      }
      AND (
        INSTR(CO.TITLE, :snippet) > 0
        OR INSTR(CO.CONTENT, :snippet) > 0
      )
  `;

  return { query, params };
}

function SELECT_CONTENT(params?: any) {
  let id, contentId;
  params && ({ id, contentId } = params);

  const query = `
    SELECT
        CO.TITLE AS TITLE
        , CO.CONTENT AS CONTENT
    FROM
        CATEGORY CA
        JOIN CONTENTS CO ON CA.ID = CO.CATEGORY_ID
    WHERE
        1 = 1
        AND CO.ID = :contentId
        AND CO.IS_DONE = 'Y'
        AND CO.IS_DELETED = 'N'
        AND CA.AUTHORITY_AUTH >= ${
          id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
        }
    ORDER BY
        CO.CREATE_DT DESC
  `;

  return { query, params };
}

function SELECT_HEARTS_COUNT_ISHEART(params?: any) {
  let ip, contentId;
  params && ({ ip, contentId } = params);

  const query = `
    SELECT
      COUNT(IP) AS COUNT
      , NVL(SUM(CASE IP WHEN :ip THEN 1 ELSE 0 END), 0) AS IS_HEART
    FROM
      HEARTS
    WHERE
      CONTENTS_ID = :contentId
  `;

  return { query, params };
}

function SELECT_ISHEART(params?: any) {
  let ip, contentId;
  params && ({ ip, contentId } = params);

  const query = `
    SELECT
      IP
    FROM
      HEARTS
    WHERE
      CONTENTS_ID = :contentId
      AND IP = :ip
  `;

  return { query, params };
}

function INSERT_HEART(params?: any) {
  let ip, contentId;
  params && ({ ip, contentId } = params);

  const query = `
    INSERT INTO HEARTS VALUES (:ip, :contentId)
  `;

  return { query, params };
}

function DELETE_HEART(params?: any) {
  let ip, contentId;
  params && ({ ip, contentId } = params);

  const query = `
    DELETE FROM HEARTS WHERE IP = :ip AND CONTENTS_ID = :contentId
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
  SELECT_USER,
  SELECT_CONTENTS_FOR_SEARCHING,
  SELECT_CONTENT,
  SELECT_HEARTS_COUNT_ISHEART,
  SELECT_ISHEART,
  INSERT_HEART,
  DELETE_HEART
};
