// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Content } from '../../../types/Content';
import { handleSql } from '../../../modules/oracleSetting';
import {
  SELECT_CONTENTS_BY_CONTENTID,
  UPDATE_CONTENT
} from '../../../queries/admin/contentManage';
import {
  handleCheckRequired,
  handleGetLocaleTime
} from '../../../modules/common';

export const updateContent: Router = Router();

/**
 * 컨텐트 갱싱
 */
updateContent.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    let { categoryId, contentId, title, content, isDone, id } = req.body;
    if (
      handleCheckRequired({ categoryId, contentId, title, content, isDone, id })
    ) {
      return res.json(Results[130]);
    }

    /* 1. 컨텐트 존재 여부 */
    let contents: null | Array<Content> = null;
    try {
      contents = await handleSql(SELECT_CONTENTS_BY_CONTENTID({ contentId }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(contents) && contents.length > 0) {
      /* 2. 컨텐트 있을 경우 값들 비교 */
      const contentFromDB: Content = contents[0];

      let shouldbeUpdated = false;

      /* 2-0. 변한 값들만 갱신하도록 구분, 모든 값을 write 하기엔 DB의 부담이 크기 때문이다.*/
      if (categoryId !== contentFromDB.CATEGORY_ID) {
        shouldbeUpdated = true;
      } else {
        categoryId = '';
      }

      if (title !== contentFromDB.TITLE) {
        shouldbeUpdated = true;
      } else {
        title = '';
      }

      if (isDone !== contentFromDB.IS_DONE) {
        shouldbeUpdated = true;
      } else {
        isDone = '';
      }

      if (content !== contentFromDB.CONTENT) {
        shouldbeUpdated = true;
      } else {
        content = '';
      }

      /* 2-1. 요청값이 모두 동일할 경우 */
      if (!shouldbeUpdated) {
        return res.json(Results[150]);
      } else {
        /* 2-2. 요청값이 하나라도 다를 경우 */
        try {
          await handleSql(
            UPDATE_CONTENT({
              title,
              update_dt: handleGetLocaleTime('db'),
              update_user: id,
              categoryId,
              isDone,
              content,
              contentId
            })
          );
        } catch (e: any) {
          return next(new Error(e.stack));
        }

        return res.json({ ...Results[0] });
      }
    } else {
      /* 3. 컨텐트 없을 경우 반환 */
      return res.json(Results[120]);
    }
  }
);
