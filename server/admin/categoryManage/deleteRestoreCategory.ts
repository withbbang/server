// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Category } from '../../../types/Category';
import { handleSql } from '../../../modules/oracleSetting';
import {
  SELECT_ALL_CATEGORIES,
  SELECT_CATEGORIES_BY_CATEGORYID_IN_DELETE_RESTORE,
  UPDATE_DELETE_RESTORE_CATEGORY
} from '../../../queries/admin/categoryManage';
import {
  handleCheckRequired,
  handleGetLocaleTime
} from '../../../modules/common';

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
    const { id, categoryId } = req.body;
    if (handleCheckRequired({ id, categoryId })) {
      return res.json(Results[130]);
    }

    /* 1. 카테고리 존재 여부 */
    let categories: null | Array<Category> = null;
    try {
      categories = await handleSql(
        SELECT_CATEGORIES_BY_CATEGORYID_IN_DELETE_RESTORE({ categoryId })
      );
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(categories) && categories.length > 0) {
      /* 2. 카테고리 있을 경우 */
      const category: Category = categories[0];

      try {
        const date = handleGetLocaleTime('db');
        await handleSql(
          UPDATE_DELETE_RESTORE_CATEGORY({
            isDeleted: category.IS_DELETED === 'Y' ? 'N' : 'Y',
            update_dt: date,
            delete_dt: category.IS_DELETED === 'Y' ? null : date,
            update_user: id,
            delete_user: category.IS_DELETED === 'Y' ? null : id,
            categoryId
          })
        );
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 3. 갱신된 카테고리들 반환 */
      try {
        categories = await handleSql(SELECT_ALL_CATEGORIES());
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      return res.json({ ...Results[0], categories });
    } else {
      /* 3. 카테고리 없을 경우 반환 */
      return res.json(Results[120]);
    }
  }
);
