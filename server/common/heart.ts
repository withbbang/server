// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import { SELECT_HEARTS_COUNT } from '../../queries/common';
import { handleSql } from '../../modules/oracleSetting';
import { Content } from '../../types/Content';
import { handleCheckRequired } from '../../modules/common';

export const heartsCount: Router = Router();
export const setHeart: Router = Router();

heartsCount.get(
  '/count/:contentId',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    const contentId = req.params.contentId;
    /* 1. 컨텐츠 조회 */
    let heartsCount: number = 0;
    try {
      heartsCount = await handleSql(SELECT_HEARTS_COUNT({ contentId }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(heartsCount) && heartsCount.length > 0) {
      /* 2. 컨텐츠 있을 경우 */
      return res.json({ ...Results[0], heartsCount: heartsCount[0].COUNT });
    } else {
      /* 3. 컨텐츠 없을 경우 */
      return res.json({ ...Results[0], heartsCount: 0 });
    }
  }
);
