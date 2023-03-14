const INSERT_TODAY_VISITOR_IP = `
    INSERT INTO VISITOR VALUES (:ip)
`;

const INSERT_USER = `
    INSERT INTO USERS (ID, PASSWORD, SALT, AUTH, CREATE_DT)
    VALUES (:id, :password, :salt, :auth, TO_DATE(:createdt, 'YYYYMMDDHH24MISS'))
`;

export { INSERT_TODAY_VISITOR_IP, INSERT_USER };
