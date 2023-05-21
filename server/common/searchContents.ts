// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import { SELECT_CONTENTS_FOR_SEARCHING } from '../../queries/common';
import { handleSql } from '../../modules/oracleSetting';
import { Content } from '../../types/Content';
import { handleCheckRequired } from '../../modules/common';

export const searchContents: Router = Router();

/**
 * 방문자 수 가져오기
 */
searchContents.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { id, snippet } = req.body;
    if (handleCheckRequired({ snippet })) {
      return res.json(Results[130]);
    }

    /* 1. 컨텐트 가져오기 */
    let contents: Array<Content> = [];

    try {
      contents = await handleSql(
        SELECT_CONTENTS_FOR_SEARCHING({ id, snippet })
      );
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    return res.json({ ...Results[0], contents });
  }
);
