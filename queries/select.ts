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

export { SELECT_ALL_VISITHISTORY, SELECT_VISITOR_IP };
