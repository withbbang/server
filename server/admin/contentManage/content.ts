// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Content } from '../../../types/Content';
import { handleSql } from '../../../modules/oracleSetting';
import { SELECT_CONTENT_BY_ADMINISTRATOR } from '../../../queries/select';
import { handleCheckRequired } from '../../../modules/common';

export const content: Router = Router();

/**
 * 컨텐트 가져오기
 */
content.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { id, contentId } = req.body;
    if (handleCheckRequired({ id, contentId })) {
      return res.json(Results[130]);
    }

    /* 1. 컨텐트 가져오기 */
    let contents: Array<Content> = [];
    try {
      contents = await handleSql(
        SELECT_CONTENT_BY_ADMINISTRATOR({ id, contentId })
      );
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(contents) && contents.length > 0) {
      return res.json({ ...Results[0], content: contents[0] });
    } else {
      return res.json({ ...Results[0] });
    }
  }
);
