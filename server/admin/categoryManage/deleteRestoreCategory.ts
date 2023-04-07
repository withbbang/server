// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Category } from '../../../types/Category';
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

export const deleteRestoreCategory: Router = Router();

/**
 * 카테고리 1개 삭제
 */
deleteRestoreCategory.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { id, categoryId, isDeleted } = req.body;
    if (handleCheckRequired({ id, categoryId, isDeleted })) {
      return res.json(Results[130]);
    }

    /* 1. 카테고리 존재 여부 */
    let categories: null | Array<Category> = null;
    try {
      categories = await handleSql(
        SELECT_CATEGORIES({ id, categoryId, isDeleted })
      );
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(categories) && categories.length > 0) {
      /* 2. 카테고리 있을 경우 값 비교 */
      const category: Category = categories[0];

      /* 2-1. 요청값이 동일할 경우 */
      if (category.IS_DELETED === isDeleted) {
        try {
          const date = handleGetLocaleTime('db');
          await handleSql(
            UPDATE_DELETE_RESTORE_CATEGORY({
              isDeleted: isDeleted === 'Y' ? 'N' : 'Y',
              update_dt: date,
              delete_dt: date,
              update_user: id,
              delete_user: id,
              categoryId
            })
          );
        } catch (e: any) {
          return next(new Error(e.stack));
        }

        /* 2-3. 갱신된 카테고리들 반환 */
        try {
          categories = await handleSql(SELECT_ALL_CATEGORIES());
        } catch (e: any) {
          return next(new Error(e.stack));
        }

        return res.json({ ...Results[0], categories });
      } else {
        /* 2-2. 요청값이 다를 경우 */
        return res.json(Results[150]);
      }
    } else {
      /* 3. 카테고리 없을 경우 반환 */
      return res.json(Results[120]);
    }
  }
);
