import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { SELECT_AUTHORITY } from '../../../queries/select';
import { handleSql } from '../../../modules/oracleSetting';
import { Authority } from '../../../types/Authority';

export const authority: Router = Router();

authority.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 1. 권한 목록 조회 */
    let authorities: null | Array<Authority> = null;

    try {
      authorities = await handleSql(SELECT_AUTHORITY());
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    return res.json({ ...Results[0], authorities });
  }
);
