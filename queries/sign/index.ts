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

function UPDATE_USER_WITHDRAW(params?: any) {
  let id, update_dt, delete_dt;
  params && ({ id, update_dt, delete_dt } = params);

  const query = `
    UPDATE
        USERS
    SET
        ACCESS_TOKEN = null
        , REFRESH_TOKEN = null
        , UPDATE_DT = TO_DATE(:update_dt, 'YYYYMMDDHH24MISS')
        , DELETE_DT = TO_DATE(:delete_dt, 'YYYYMMDDHH24MISS')
        , IS_DELETED = 'Y'
    WHERE
        ID = :id
  `;

  return { query, params };
}

function INSERT_USER(params?: any) {
  let id, password, salt, auth, create_dt;
  params && ({ id, password, salt, auth, create_dt } = params);

  const query = `
    INSERT INTO USERS (
        ID
        , PASSWORD
        , SALT
        , AUTH
        , CREATE_DT
    ) VALUES (
        :id
        , :password
        , :salt
        , :auth
        , TO_DATE(:create_dt, 'YYYYMMDDHH24MISS')
    )
  `;

  return { query, params };
}

export { SELECT_USER, UPDATE_USER_WITHDRAW, INSERT_USER };
