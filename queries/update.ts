const UPDATE_INCREMENT_VISITHISTORY = `
    UPDATE
        VISITHISTORY
    SET
        TOTAL = TOTAL + 1
        , TODAY = TODAY + 1
`;

const UPDATE_INITIATE_TOTAY_VISITHISTORY = `
    UPDATE
        VISITHISTORY
    SET
        TODAY = 0
`;

const UPDATE_USER_LOGIN = `
    UPDATE
        USERS
    SET
        ACCESS_TOKEN = :accessToken
        , REFRESH_TOKEN = :refreshToken
    WHERE
        ID = :id
        AND SALT = :salt
        AND PASSWORD = :password
`;

const UPDATE_USER_ACCESS_TOKEN = `
    UPDATE
        USERS
    SET
        ACCESS_TOKEN = :accessToken
    WHERE
        ID = :id
`;

const UPDATE_USER_LOGOUT = `
    UPDATE
        USERS
    SET
        ACCESS_TOKEN = null
        , REFRESH_TOKEN = null
    WHERE
        ID = :id
`;

/**
 * updatedt, deletedt 모두 동일한 변수로 사용하려 했지만
 * ORA-01745: invalid host/bind variable name 에러로 인하여 서로 다른 변수로 적용함
 */
const UPDATE_USER_WITHDRAW = `
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

export {
  UPDATE_INCREMENT_VISITHISTORY,
  UPDATE_INITIATE_TOTAY_VISITHISTORY,
  UPDATE_USER_LOGIN,
  UPDATE_USER_ACCESS_TOKEN,
  UPDATE_USER_LOGOUT,
  UPDATE_USER_WITHDRAW
};
