// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';
import { Results } from '../../enums/Results';
import { handleSql } from '../../modules/oracleSetting';
import { SELECT_VISIT_COUNT } from '../../queries/select';

// 모듈 임포트
import { VisitCount } from '../../types/VisitCount';

export const visitCount: Router = Router();

/**
 * 방문자 수 가져오기
 */
visitCount.get(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    let visitCount: null | Array<VisitCount> = null;
    try {
      visitCount = await handleSql(SELECT_VISIT_COUNT());
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (visitCount && visitCount.length > 0) {
      return res.json({
        ...Results[0],
        today: visitCount[0].TODAY,
        total: visitCount[0].TOTAL
      });
    } else {
      return res.json(Results[10]);
    }
  }
);
