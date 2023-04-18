function SELECT_VISIT_COUNT() {
  const query = `
        SELECT * FROM VISITHISTORY
    `;

  return { query };
}

function SELECT_CATEGORIES(params?: any) {
  // 구조분해 할당 먼저 선언하는 방법
  let id;
  params && ({ id } = params);

  const query = `
      SELECT
        TITLE
        , PATH
      FROM
        CATEGORY
      WHERE
        1 = 1
        AND IS_DELETED = 'N'
        AND AUTHORITY_AUTH >= ${
          id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
        }
      ORDER BY
        PRIORITY
    `;

  return { query, params };
}

function SELECT_CONTENTS(params?: any) {
  let id, path;
  params && ({ id, path } = params);

  const query = `
    SELECT
        CO.ID AS ID
        , CO.TITLE AS TITLE
        , SUBSTR(CO.CONTENT, 1, 300) AS CONTENT
        , CO.PATH AS PATH
    FROM
        CATEGORY CA
        JOIN CONTENTS CO ON CA.ID = CO.CATEGORY_ID
    WHERE
        1 = 1
        AND CA.IS_DELETED = 'N'
        AND CO.IS_DELETED = 'N'
        AND AUTHORITY_AUTH >= ${
          id ? '(SELECT AUTH FROM USERS WHERE ID = :id)' : 20
        }
        ${path ? 'AND CA.PATH = :path' : ''}
    ORDER BY
        CO.CREATE_DT DESC
    `;

  return { query, params };
}

export { SELECT_VISIT_COUNT, SELECT_CATEGORIES, SELECT_CONTENTS };
