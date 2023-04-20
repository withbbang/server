// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Content } from '../../../types/Content';
import { handleSql } from '../../../modules/oracleSetting';
import {
  SELECT_ALL_CONTENTS,
  SELECT_CONTENT_BY_CONTENTID_FOR_DELETE_RESTORE,
  UPDATE_DELETE_RESTORE_CONTENT
} from '../../../queries/admin/contentManage';
import {
  handleCheckRequired,
  handleGetLocaleTime
} from '../../../modules/common';

export const deleteRestoreContent: Router = Router();

/**
 * 컨텐트 1개 삭제
 */
deleteRestoreContent.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { id, contentId } = req.body;
    if (handleCheckRequired({ id, contentId })) {
      return res.json(Results[130]);
    }

    /* 1. 컨텐트 존재 여부 */
    let contents: null | Array<Content> = null;
    try {
      contents = await handleSql(
        SELECT_CONTENT_BY_CONTENTID_FOR_DELETE_RESTORE({ contentId })
      );
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(contents) && contents.length > 0) {
      /* 2. 컨텐트 있을 경우 값 비교 */
      const content: Content = contents[0];

      try {
        const date = handleGetLocaleTime('db');
        await handleSql(
          UPDATE_DELETE_RESTORE_CONTENT({
            isDeleted: content.IS_DELETED === 'Y' ? 'N' : 'Y',
            update_dt: date,
            delete_dt: content.IS_DELETED === 'Y' ? null : date,
            update_user: id,
            delete_user: content.IS_DELETED === 'Y' ? null : id,
            contentId
          })
        );
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 2-3. 갱신된 컨텐트들 반환 */
      try {
        contents = await handleSql(SELECT_ALL_CONTENTS());
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      return res.json({ ...Results[0], contents });
    } else {
      /* 3. 컨텐트 없을 경우 반환 */
      return res.json(Results[120]);
    }
  }
);
