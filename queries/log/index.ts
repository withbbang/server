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

function UPDATE_USER_LOGIN(params?: any) {
  let accessToken, refreshToken, id, salt, password;
  params && ({ accessToken, refreshToken, id, salt, password } = params);

  const query = `
    UPDATE
        USERS
    SET
        ACCESS_TOKEN = :accessToken
        , REFRESH_TOKEN = :refreshToken
    WHERE
        1 = 1
        AND ID = :id
        AND SALT = :salt
        AND PASSWORD = :password
    `;

  return { query, params };
}

function UPDATE_USER_LOGOUT(params?: any) {
  let id;
  params && ({ id } = params);

  const query = `
    UPDATE
        USERS
    SET
        ACCESS_TOKEN = null
        , REFRESH_TOKEN = null
    WHERE
        ID = :id
  `;

  return { query, params };
}

export { SELECT_USER, UPDATE_USER_LOGIN, UPDATE_USER_LOGOUT };
