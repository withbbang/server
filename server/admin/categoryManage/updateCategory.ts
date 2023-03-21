// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Category } from '../../../types/Category';
import { handleMultipleSql, handleSql } from '../../../modules/oracleSetting';
import { SELECT_ALL_CATEGORIES } from '../../../queries/select';
import { UPDATE_CATEGORY } from '../../../queries/update';
import { handleGetLocaleTime } from '../../../modules/common';

export const updateCategory: Router = Router();

/**
 * 카테고리 갱신
 * 모든 리스트 한번에 갱신
 */
updateCategory.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    if (!req.body.categories) {
      return res.json(Results[120]);
    }

    /* 1. 카테고리들 가져오기 */
    let categoriesFromDB: Array<Category> = [];
    try {
      categoriesFromDB = await handleSql(SELECT_ALL_CATEGORIES());
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (req.body.categories.length < 1) {
      /* 2. 화면에서 넘어온 데이터가 없을 경우 */
      return res.json(Results[110]);
    } else if (req.body.categories.length === categoriesFromDB?.length) {
      /* 3. 한번에 갱신 */

      /* 3-1. 오름차순 정렬 */
      const categoriesFromClient: Array<Category> = req.body.categories.sort(
        (a: Category, b: Category) => a.ID - b.ID
      );
      categoriesFromDB = categoriesFromDB.sort(
        (a: Category, b: Category) => a.ID - b.ID
      );

      /* 3-2. 비교값 중 다른게 있을 경우만 갱신 */
      const toBeData: Array<Category> = categoriesFromClient.filter(
        (category, idx) => {
          return (
            category.TITLE !== categoriesFromDB[idx].TITLE ||
            category.PRIORITY !== categoriesFromDB[idx].PRIORITY
          );
        }
      );

      /* 3-3. 다중 갱신 */
      const { query } = UPDATE_CATEGORY();
      const params = toBeData.map((data: Category) => {
        return {
          id: data.ID,
          title: data.TITLE,
          priority: data.PRIORITY,
          update_dt: handleGetLocaleTime('db'),
          update_user: req.body.id
        };
      });

      try {
        await handleMultipleSql(query, params);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      return res.json(Results[0]);
    } else {
      /* 4. 그 외의 알 수 없는 요청 */
      return res.json(Results[130]);
    }
  }
);
