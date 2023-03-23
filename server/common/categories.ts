// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import { Category } from '../../types/Category';
import { User } from '../../types/User';
import { handleSql } from '../../modules/oracleSetting';
import { SELECT_CATEGORIES, SELECT_USER } from '../../queries/select';

export const categories: Router = Router();

/**
 * 사용자별 카테고리 목록 가져오기
 */
categories.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    const id: any | undefined = req.body.id;

    console.log('id: ', id);

    /* 1. 회원 존재 여부 확인 */
    let users: null | Array<User> = null;
    try {
      users = await handleSql(SELECT_USER({ id }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2 AUTH 설정 */
    let auth: number | undefined;
    if (Array.isArray(users) && users.length === 1 && id === users[0].ID) {
      auth = users[0].AUTH;
    }

    /* 3. 카테고리들 가져오기 */
    let categories: null | Array<Category> = null;
    try {
      categories = await handleSql(SELECT_CATEGORIES({ auth }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    return res.json({ ...Results[0], categories });
  }
);
