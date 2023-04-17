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
  const { title, priority, create_dt, id, auth, path } = params;
  const query = `
    INSERT INTO CATEGORY (
      TITLE
      , PRIORITY
      , CREATE_DT
      , CREATE_USER
      , IS_DELETED
      , AUTHORITY_AUTH
      , PATH
    )
    VALUES (
      :title
      , ${
        typeof priority === 'number'
          ? ':priority'
          : '(SELECT MAX(PRIORITY) + 1 FROM CATEGORY)'
      }
      , TO_DATE(:create_dt, 'YYYYMMDDHH24MISS')
      , :id
      , 'N'
      , ${typeof auth === 'number' ? ':auth' : 20}
      , :path
    )
  `;

  return { query, params };
}

function INSERT_CONTENT(params: any) {
  const { categoryId, title, content, id, create_dt } = params;
  const query = `
    INSERT INTO CONTENTS (
      CATEGORY_ID
      , TITLE
      , CONTENT
      , CREATE_USER
      , CREATE_DT
    ) VALUES (
      :categoryId
      , :title
      , :content
      , :id
      , TO_DATE(:create_dt, 'YYYYMMDDHH24MISS')
    )
  `;

  return { query, params };
}

export {
  INSERT_TODAY_VISITOR_IP,
  INSERT_USER,
  INSERT_CATEGORY,
  INSERT_CONTENT
};
