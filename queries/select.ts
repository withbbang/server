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

export { SELECT_VISITOR_IP, SELECT_USER };
