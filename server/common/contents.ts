// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import { SELECT_CONTENTS } from '../../queries/common';
import { handleSql } from '../../modules/oracleSetting';
import { Content } from '../../types/Content';

export const contents: Router = Router();

contents.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 1. 컨텐츠 목록 조회 */
    let contents: null | Array<Content> = null;
    try {
      contents = await handleSql(
        SELECT_CONTENTS({ id: req.body.id, path: req.body.path })
      );
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    return res.json({ ...Results[0], contents });
  }
);
