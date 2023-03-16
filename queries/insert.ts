function INSERT_TODAY_VISITOR_IP(params: any) {
  const { ip } = params;
  const query = `INSERT INTO VISITOR VALUES (:ip)`;

  return { query, params };
}

function INSERT_USER(params: any) {
  const { id, password, salt, auth, createdt } = params;
  const query = `
        INSERT INTO USERS (ID, PASSWORD, SALT, AUTH, CREATE_DT)
        VALUES (:id, :password, :salt, :auth, TO_DATE(:createdt, 'YYYYMMDDHH24MISS'))
    `;

  return { query, params };
}

export { INSERT_TODAY_VISITOR_IP, INSERT_USER };
