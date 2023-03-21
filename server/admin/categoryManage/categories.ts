// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Category } from '../../../types/Category';
import { handleSql } from '../../../modules/oracleSetting';
import { SELECT_ALL_CATEGORIES } from '../../../queries/select';

export const categories: Router = Router();

/**
 * 카테고리들 가져오기
 */
categories.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 1. 카테고리들 가져오기 */
    let categories: null | Array<Category> = null;
    try {
      categories = await handleSql(SELECT_ALL_CATEGORIES());
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    return res.json({ ...Results[0], categories });
  }
);
