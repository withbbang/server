// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Category } from '../../../types/Category';
import { handleSql } from '../../../modules/oracleSetting';
import { SELECT_CATEGORIES } from '../../../queries/select';
import { INSERT_CATEGORY } from '../../../queries/insert';
import { handleGetLocaleTime } from '../../../modules/common';

export const createCategory: Router = Router();

/**
 * 카테고리 생성
 */
createCategory.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    if (!req.body.title) {
      return res.json(Results[120]);
    }

    /* 1. 카테고리 존재 여부 */
    let categories: null | Array<Category> = null;
    try {
      categories = await handleSql(
        SELECT_CATEGORIES({ title: req.body.title })
      );
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(categories) && categories.length > 0) {
      /* 2. 이미 존재하는 타이틀 */
      return res.json(Results[100]);
    } else {
      /* 3. 없는 타이틀 */
      try {
        await handleSql(
          INSERT_CATEGORY({
            title: req.body.title,
            priority: req.body.priority,
            create_dt: handleGetLocaleTime('db'),
            create_user: req.body.id
          })
        );
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      return res.json(Results[0]);
    }
  }
);