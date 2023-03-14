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

export {
  UPDATE_INCREMENT_VISITHISTORY,
  UPDATE_INITIATE_TOTAY_VISITHISTORY,
  UPDATE_USER_LOGIN,
  UPDATE_USER_ACCESS_TOKEN,
  UPDATE_USER_LOGOUT
};
