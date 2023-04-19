// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Content } from '../../../types/Content';
import { handleSql } from '../../../modules/oracleSetting';
import {
  SELECT_ALL_CATEGORIES,
  SELECT_CATEGORIES
} from '../../../queries/select';
import {
  handleCheckRequired,
  handleGetLocaleTime
} from '../../../modules/common';
import { UPDATE_DELETE_RESTORE_CATEGORY } from '../../../queries/update';

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
      contents = await handleSql(SELECT_CATEGORIES({ contentId }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(contents) && contents.length > 0) {
      /* 2. 컨텐트 있을 경우 값 비교 */
      const content: Content = contents[0];

      try {
        const date = handleGetLocaleTime('db');
        await handleSql(
          UPDATE_DELETE_RESTORE_CATEGORY({
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
        contents = await handleSql(SELECT_ALL_CATEGORIES());
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
