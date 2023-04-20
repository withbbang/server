function SELECT_ALL_CATEGORIES() {
  const query = `
      SELECT
        CA.ID AS ID
        , CA.TITLE AS TITLE
        , CA.PRIORITY AS PRIORITY
        , CA.PATH AS PATH
        , AUTH.DESCRIPTION AS DESCRIPTION
        , IS_DELETED AS IS_DELETED
        , AUTH.AUTH AS AUTH
      FROM
        CATEGORY CA
        JOIN AUTHORITY AUTH ON CA.AUTHORITY_AUTH = AUTH.AUTH
      ORDER BY
        CA.PRIORITY
    `;

  return { query };
}

function SELECT_CATEGORIES_BY_TITLE(params?: any) {
  // 구조분해 할당 먼저 선언하는 방법
  let title;
  params && ({ title } = params);

  const query = `
      SELECT ID FROM CATEGORY WHERE TITLE = :title
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

function SELECT_CATEGORY_BY_CATEGORYID_FOR_DELETE_RESTORE(params?: any) {
  // 구조분해 할당 먼저 선언하는 방법
  let categoryId;
  params && ({ categoryId } = params);

  const query = `
        SELECT IS_DELETED FROM CATEGORY WHERE ID = :categoryId
      `;

  return { query, params };
}

function SELECT_CATEGORY_BY_CATEGORYID_FOR_SINGLE_UPDATE(params?: any) {
  // 구조분해 할당 먼저 선언하는 방법
  let categoryId;
  params && ({ categoryId } = params);

  const query = `
    SELECT
      CA.TITLE AS TITLE
      , CA.PATH AS PATH
      , AUTH.AUTH AS AUTH
    FROM
      CATEGORY CA
      JOIN AUTHORITY AUTH ON CA.AUTHORITY_AUTH = AUTH.AUTH
    WHERE
      1 = 1
      ${categoryId ? 'AND CA.ID = :categoryId' : ''}
    ORDER BY
      CA.PRIORITY
  `;

  return { query, params };
}

function UPDATE_DELETE_RESTORE_CATEGORY(params?: any) {
  const {
    isDeleted,
    update_dt,
    delete_dt,
    update_user,
    delete_user,
    categoryId
  } = params;

  const query = `
      UPDATE
        CATEGORY
      SET
        IS_DELETED = :isDeleted
        , UPDATE_DT = TO_DATE(:update_dt, 'YYYYMMDDHH24MISS')
        , DELETE_DT = TO_DATE(:delete_dt, 'YYYYMMDDHH24MISS')
        , UPDATE_USER = :update_user
        , DELETE_USER = :delete_user
      WHERE
        ID = :categoryId
    `;

  return { query, params };
}

function UPDATE_MULTI_CATEGORY(params?: any) {
  // 구조분해 할당 먼저 선언하는 방법
  let priority, update_dt, update_user, categoryId;
  params && ({ priority, update_dt, update_user, categoryId } = params);

  const query = `
      UPDATE
        CATEGORY
      SET
        UPDATE_DT = TO_DATE(:update_dt, 'YYYYMMDDHH24MISS')
        ${priority ? ', PRIORITY = :priority' : ''}
        , UPDATE_USER = :update_user
      WHERE
        ID = :categoryId
    `;

  return { query, params };
}

function UPDATE_SINGLE_CATEGORY(params?: any) {
  // 구조분해 할당 먼저 선언하는 방법
  let title, update_dt, update_user, auth, path, categoryId;
  params &&
    ({ title, update_dt, update_user, auth, path, categoryId } = params);

  const query = `
      UPDATE
        CATEGORY
      SET
        UPDATE_DT = TO_DATE(:update_dt, 'YYYYMMDDHH24MISS')
        , TITLE = :title
        , UPDATE_USER = :update_user
        , AUTHORITY_AUTH = :auth
        , PATH = :path
      WHERE
        ID = :categoryId
    `;

  return { query, params };
}

export {
  SELECT_ALL_CATEGORIES,
  SELECT_CATEGORIES_BY_TITLE,
  INSERT_CATEGORY,
  SELECT_CATEGORY_BY_CATEGORYID_FOR_DELETE_RESTORE,
  SELECT_CATEGORY_BY_CATEGORYID_FOR_SINGLE_UPDATE,
  UPDATE_DELETE_RESTORE_CATEGORY,
  UPDATE_MULTI_CATEGORY,
  UPDATE_SINGLE_CATEGORY
};
