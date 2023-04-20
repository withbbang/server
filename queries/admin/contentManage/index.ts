function SELECT_ALL_CONTENTS() {
  const query = `
    SELECT
        ID AS ID
        , TITLE AS TITLE
        , SUBSTR(CONTENT, 1, 300) AS CONTENT
        , IS_DELETED AS IS_DELETED
        , PATH AS PATH
    FROM
        CONTENTS
    ORDER BY
        CREATE_DT DESC
    `;

  return { query };
}

function SELECT_CONTENTS_BY_TITLE(params?: any) {
  let title;
  params && ({ title } = params);

  const query = `
    SELECT ID FROM CONTENTS WHERE TITLE = :title
  `;

  return { query, params };
}

function SELECT_CONTENTS_BY_CONTENTID(params?: any) {
  let id, contentId;
  params && ({ id, contentId } = params);

  const query = `
    SELECT
        CO.ID AS ID
        , CO.CATEGORY_ID AS CATEGORY_ID
        , CO.TITLE AS TITLE
        , CO.CONTENT AS CONTENT
        , CO.HIT AS HIT
        , CO.HEART AS HEART
        , CO.CREATE_DT AS CREATE_DT
        , CO.UPDATE_DT AS UPDATE_DT
        , CO.IS_DONE AS IS_DONE
    FROM
        CATEGORY CA
        JOIN CONTENTS CO ON CA.ID = CO.CATEGORY_ID
    WHERE
        1 = 1
        AND CA.AUTHORITY_AUTH >= ${
          id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
        }
        AND CO.ID = :contentId
    `;

  return { query, params };
}

function INSERT_CONTENT(params: any) {
  const { categoryId, title, content, id, isDone, create_dt } = params;
  const query = `
      INSERT INTO CONTENTS (
        CATEGORY_ID
        , TITLE
        , CONTENT
        , CREATE_USER
        , CREATE_DT
        , IS_DONE
      ) VALUES (
        :categoryId
        , :title
        , :content
        , :id
        , TO_DATE(:create_dt, 'YYYYMMDDHH24MISS')
        , :isDone
      )
    `;

  return { query, params };
}

function SELECT_CONTENT_BY_CONTENTID_FOR_DELETE_RESTORE(params?: any) {
  // 구조분해 할당 먼저 선언하는 방법
  let contentId;
  params && ({ contentId } = params);

  const query = `
          SELECT IS_DELETED FROM CONTENTS WHERE ID = :contentId
        `;

  return { query, params };
}

function UPDATE_DELETE_RESTORE_CONTENT(params?: any) {
  const {
    isDeleted,
    update_dt,
    delete_dt,
    update_user,
    delete_user,
    contentId
  } = params;

  const query = `
        UPDATE
          CONTENT
        SET
          IS_DELETED = :isDeleted
          , UPDATE_DT = TO_DATE(:update_dt, 'YYYYMMDDHH24MISS')
          , DELETE_DT = TO_DATE(:delete_dt, 'YYYYMMDDHH24MISS')
          , UPDATE_USER = :update_user
          , DELETE_USER = :delete_user
        WHERE
          ID = :contentId
      `;

  return { query, params };
}

export {
  SELECT_ALL_CONTENTS,
  SELECT_CONTENTS_BY_TITLE,
  SELECT_CONTENTS_BY_CONTENTID,
  INSERT_CONTENT,
  SELECT_CONTENT_BY_CONTENTID_FOR_DELETE_RESTORE,
  UPDATE_DELETE_RESTORE_CONTENT
};
