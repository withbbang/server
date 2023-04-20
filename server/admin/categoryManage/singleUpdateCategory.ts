// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Category } from '../../../types/Category';
import { handleSql } from '../../../modules/oracleSetting';
import {
  SELECT_ALL_CATEGORIES,
  SELECT_CATEGORY_BY_CATEGORYID_FOR_SINGLE_UPDATE,
  UPDATE_SINGLE_CATEGORY
} from '../../../queries/admin/categoryManage';
import {
  handleCheckRequired,
  handleGetLocaleTime
} from '../../../modules/common';

export const singleUpdateCategory: Router = Router();

/**
 * 카테고리 1개 수정
 */
singleUpdateCategory.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { title, id, path, categoryId, auth } = req.body;
    if (handleCheckRequired({ title, id, path, categoryId, auth })) {
      return res.json(Results[130]);
    }

    /* 1. 카테고리 존재 여부 */
    let categories: null | Array<Category> = null;
    try {
      categories = await handleSql(
        SELECT_CATEGORY_BY_CATEGORYID_FOR_SINGLE_UPDATE({ categoryId })
      );
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(categories) && categories.length > 0) {
      /* 2. 카테고리 있을 경우 값들 비교 */
      const category: Category = categories[0];

      /* 2-1. 요청값이 모두 동일할 경우 */
      if (
        title === category.TITLE &&
        path === category.PATH &&
        auth === category.AUTH
      ) {
        return res.json(Results[150]);
      } else {
        /* 2-2. 요청값이 하나라도 다를 경우 */
        try {
          await handleSql(
            UPDATE_SINGLE_CATEGORY({
              title,
              update_dt: handleGetLocaleTime('db'),
              update_user: id,
              auth,
              path,
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
      }
    } else {
      /* 3. 카테고리 없을 경우 반환 */
      return res.json(Results[120]);
    }
  }
);
