// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Content } from '../../../types/Content';
import { handleSql } from '../../../modules/oracleSetting';
import { SELECT_ALL_CONTENTS } from '../../../queries/admin/contentManage';

export const contents: Router = Router();

/**
 * 컨텐츠 가져오기
 */
contents.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 1. 컨텐츠 가져오기 */
    let contents: null | Array<Content> = null;
    try {
      contents = await handleSql(SELECT_ALL_CONTENTS());
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    return res.json({ ...Results[0], contents });
  }
);
