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

export {
  SELECT_ALL_CONTENTS,
  SELECT_CONTENTS_BY_TITLE,
  SELECT_CONTENTS_BY_CONTENTID,
  INSERT_CONTENT
};
