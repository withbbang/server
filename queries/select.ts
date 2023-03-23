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
  const { title, id, auth } = params;
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
      ${id ? 'AND ID = :id' : ''}
      ${title ? 'AND TITLE = :title' : ''}
      AND AUTHORITY_AUTH >= ${typeof auth === 'number' ? ':auth' : 20}
  `;

  return { query, params };
}

function SELECT_VISIT_COUNT() {
  const query = `
    SELECT * FROM VISITHISTORY
  `;

  return { query };
}

export {
  SELECT_VISITOR_IP,
  SELECT_USER,
  SELECT_ALL_CATEGORIES,
  SELECT_CATEGORIES,
  SELECT_VISIT_COUNT
};
