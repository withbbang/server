// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import { SELECT_CONTENTS } from '../../queries/select';
import { handleSql } from '../../modules/oracleSetting';
import { Content } from '../../types/Content';

export const content: Router = Router();

content.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    const id: string | undefined = req.body.id;
    const title: string | undefined = req.body.title;

    /* 1. 컨텐츠 목록 조회 */
    let contents: null | Array<Content> = null;
    try {
      contents = await handleSql(SELECT_CONTENTS({ title, id }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    return res.json({ ...Results[0], contents });
  }
);
