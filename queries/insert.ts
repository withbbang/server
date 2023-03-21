function INSERT_TODAY_VISITOR_IP(params: any) {
  const { ip } = params;
  const query = `INSERT INTO VISITOR VALUES (:ip)`;

  return { query, params };
}

function INSERT_USER(params: any) {
  const { id, password, salt, auth, create_dt } = params;
  const query = `
    INSERT INTO USERS (ID, PASSWORD, SALT, AUTH, CREATE_DT)
    VALUES (:id, :password, :salt, :auth, TO_DATE(:create_dt, 'YYYYMMDDHH24MISS'))
  `;

  return { query, params };
}

function INSERT_CATEGORY(params: any) {
  const { title, priority, create_dt, create_user } = params;
  const query = `
    INSERT INTO CATEGORY (TITLE, PRIORITY, CREATE_DT, CREATE_USER)
    VALUES (:title, :priority, TO_DATE(:create_dt, 'YYYYMMDDHH24MISS'), :create_user);
  `;

  return { query, params };
}

export { INSERT_TODAY_VISITOR_IP, INSERT_USER, INSERT_CATEGORY };
