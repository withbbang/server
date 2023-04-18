// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Category } from '../../../types/Category';
import { handleMultipleSql, handleSql } from '../../../modules/oracleSetting';
import {
  SELECT_ALL_CATEGORIES,
  UPDATE_MULTI_CATEGORY
} from '../../../queries/admin/categoryManage';
import {
  handleCheckRequired,
  handleGetLocaleTime
} from '../../../modules/common';

export const multiupdateCategory: Router = Router();

/**
 * 카테고리 갱신
 * 모든 리스트 한번에 갱신
 */
multiupdateCategory.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { id, categories } = req.body;
    if (handleCheckRequired({ id, categories })) {
      return res.json(Results[130]);
    }

    /* 1. 카테고리들 가져오기 */
    let categoriesFromDB: Array<Category> = [];
    try {
      categoriesFromDB = await handleSql(SELECT_ALL_CATEGORIES());
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (categories.length < 1) {
      /* 2. 화면에서 넘어온 데이터가 없을 경우 */
      return res.json(Results[120]);
    } else if (categories.length === categoriesFromDB?.length) {
      /* 3. 한번에 갱신 */

      /* 3-2. 비교값 중 다른게 있을 경우만 갱신 */
      const toBeData: Array<Category> = req.body.categories.filter(
        (category: Category, idx: number) => {
          return category.ID !== categoriesFromDB[idx].ID;
        }
      );

      /* 3-3. 갱신할게 없는 경우 */
      if (toBeData.length < 1) {
        return res.json(Results[110]);
      }

      /* 3-3. 다중 갱신 */
      const params = toBeData.map((data: Category) => {
        return {
          priority: data.PRIORITY,
          update_dt: handleGetLocaleTime('db'),
          update_user: id,
          categoryId: data.ID
        };
      });

      const { query } = UPDATE_MULTI_CATEGORY(params[0]);

      try {
        await handleMultipleSql(query, params);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 4. 새로운 카테고리들 반환 */
      let categories: null | Array<Category> = null;
      try {
        categories = await handleSql(SELECT_ALL_CATEGORIES());
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      return res.json({ ...Results[0], categories });
    } else {
      /* 5. 그 외의 알 수 없는 요청 */
      return res.json(Results[140]);
    }
  }
);
