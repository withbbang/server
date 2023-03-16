function UPDATE_INCREMENT_VISITHISTORY(params: any = undefined) {
  const query = `
        UPDATE
            VISITHISTORY
        SET
            TOTAL = TOTAL + 1
            , TODAY = TODAY + 1
    `;

  return { query, params };
}

function UPDATE_INITIATE_TOTAY_VISITHISTORY(params: any = undefined) {
  const query = `
        UPDATE
            VISITHISTORY
        SET
            TODAY = 0
    `;

  return { query, params };
}

function UPDATE_USER_LOGIN(params: any) {
  const { accessToken, refreshToken, id, salt, password } = params;
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

function UPDATE_USER_LOGOUT(params: any) {
  const { id } = params;
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

/**
 * updatedt, deletedt 모두 동일한 변수로 사용하려 했지만
 * ORA-01745: invalid host/bind variable name 에러로 인하여 서로 다른 변수로 적용함
 */
function UPDATE_USER_WITHDRAW(params: any) {
  const { id, updatedt, deletedt } = params;
  const query = `
        UPDATE
            USERS
        SET
            ACCESS_TOKEN = null
            , REFRESH_TOKEN = null
            , UPDATE_DT = TO_DATE(:updatedt, 'YYYYMMDDHH24MISS')
            , DELETE_DT = TO_DATE(:deletedt, 'YYYYMMDDHH24MISS')
            , IS_DELETED = 'Y'
        WHERE
            ID = :id
      `;

  return { query, params };
}

export {
  UPDATE_INCREMENT_VISITHISTORY,
  UPDATE_INITIATE_TOTAY_VISITHISTORY,
  UPDATE_USER_LOGIN,
  UPDATE_USER_ACCESS_TOKEN,
  UPDATE_USER_LOGOUT,
  UPDATE_USER_WITHDRAW
};
