const SELECT_ALL_VISITHISTORY = `
    SELECT
        *
    FROM
        VISITHISTORY
`;

const SELECT_VISITOR_IP = `
    SELECT
        IP
    FROM
        VISITOR
    WHERE
        IP = :ip
`;

const SELECT_USER = `
    SELECT
        ID
        , PASSWORD
        , SALT
        , ACCESS_TOKEN
        , REFRESH_TOKEN
    FROM
        USERS
    WHERE
        ID = :id
`;

export { SELECT_ALL_VISITHISTORY, SELECT_VISITOR_IP, SELECT_USER };
