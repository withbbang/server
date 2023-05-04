// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import { SELECT_CONTENT } from '../../queries/common';
import { handleSql } from '../../modules/oracleSetting';
import { Content } from '../../types/Content';
import { handleCheckRequired } from '../../modules/common';

export const content: Router = Router();

content.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { contentId } = req.body;
    if (handleCheckRequired({ contentId })) {
      return res.json(Results[130]);
    }

    /* 1. 컨텐츠 목록 조회 */
    let contents: null | Array<Content> = null;
    try {
      contents = await handleSql(
        SELECT_CONTENT({ id: req.body.id, contentId })
      );
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(contents) && contents.length > 0) {
      /* 2. 컨텐츠 있을 경우 */
      return res.json({ ...Results[0], content: contents[0] });
    } else {
      /* 3. 컨텐츠 없을 경우 */
      return res.json({ ...Results[0] });
    }
  }
);
