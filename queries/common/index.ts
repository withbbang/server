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
        , CA.TITLE AS CATEGORY
        , TO_CHAR(CO.CREATE_DT, 'YYYY. MM. DD') AS CREATE_DT
        , TO_CHAR(CO.UPDATE_DT, 'YYYY. MM. DD') AS UPDATE_DT
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

function SELECT_COMMENTS(params?: any) {
  let contentId;
  params && ({ contentId } = params);

  const query = `
    SELECT
      ID
      , REF_ID
      , (CASE IS_SECRET WHEN 'Y' THEN '익명' ELSE NICKNAME END) AS NICKNAME
      , (CASE IS_SECRET WHEN 'Y' THEN '비밀 댓글입니다.' ELSE COMMENTS END) AS COMMENTS
      , TO_CHAR(CREATE_DT, 'YYYY.MM.DD HH24:mm:ss') AS CREATE_DT
      , UPDATE_DT
      , IS_SECRET
    FROM
      COMMENTS
    WHERE
      CONTENTS_ID = :contentId
      AND IS_DELETED = 'N'
    ORDER BY
      CREATE_DT
  `;

  return { query, params };
}

function INSERT_COMMENT(params?: any) {
  let ip, nickName, password, contentId, comments, create_dt, isSecret, refId;
  params &&
    ({
      ip,
      nickName,
      password,
      contentId,
      comments,
      create_dt,
      isSecret,
      refId
    } = params);

  const query = `
    INSERT INTO COMMENTS(
      IP
      , NICKNAME
      , PASSWORD
      , CONTENTS_ID
      , COMMENTS
      , CREATE_DT
      ${isSecret ? ', IS_SECRET' : ''}
      ${refId ? ', REF_ID' : ''}
    ) VALUES (
      :ip
      , :nickName
      , :password
      , :contentId
      , :comments
      , TO_DATE(:create_dt, 'YYYYMMDDHH24MISS')
      , ${isSecret ? ':isSecret' : 'N'}
      ${refId ? ', :refId' : ''}
    )
  `;

  return { query, params };
}

function SELECT_CONTENT_FOR_EXISTS(params?: any) {
  let contentId;
  params && ({ contentId } = params);

  const query = `
    SELECT
      ID
    FROM
      CONTENTS
    WHERE
      ID = :contentId
  `;

  return { query, params };
}

function SELECT_COMMENT_FOR_EXISTS(params?: any) {
  let id;
  params && ({ id } = params);

  const query = `
    SELECT
      ID
      , NICKNAME
      , PASSWORD
      , COMMENTS
      , IS_SECRET
    FROM
      COMMENTS
    WHERE
      ID = :id
  `;

  return { query, params };
}

function UPDATE_COMMENT(params?: any) {
  let id, ip, nickName, password, comments, update_dt, isSecret;
  params &&
    ({ id, ip, nickName, password, comments, update_dt, isSecret } = params);

  const query = `
    UPDATE
      COMMENTS
    SET
      UPDATE_DT = TO_DATE(:update_dt, 'YYYYMMDDHH24MISS')
      ${ip ? ', IP = :ip' : ''}
      ${nickName ? ', NICKNAME = :nickName' : ''}
      ${password ? ', PASSWORD = :password' : ''}
      ${comments ? ', COMMENTS = :comments' : ''}
      ${isSecret ? ', IS_SECRET = :isSecret' : ''}
    WHERE
      ID = :id
  `;

  return { query, params };
}

function DELETE_COMMENT(params?: any) {
  let commentId, delete_dt;
  params && ({ commentId, delete_dt } = params);

  const query = `
    UPDATE
      COMMENTS
    SET
      DELETE_DT = TO_DATE(:update_dt, 'YYYYMMDDHH24MISS')
      , IS_DELETED = 'Y'
    WHERE
      ID = :commentId
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
  DELETE_HEART,
  SELECT_COMMENTS,
  INSERT_COMMENT,
  SELECT_CONTENT_FOR_EXISTS,
  SELECT_COMMENT_FOR_EXISTS,
  UPDATE_COMMENT,
  DELETE_COMMENT
};
