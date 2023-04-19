// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../../enums/Results';
import { Content } from '../../../types/Content';
import { handleSql } from '../../../modules/oracleSetting';
import {
  SELECT_CONTENTS_BY_TITLE,
  INSERT_CONTENT
} from '../../../queries/admin/contentManage';
import {
  handleCheckRequired,
  handleGetLocaleTime
} from '../../../modules/common';

export const createContent: Router = Router();

/**
 * 컨텐트 생성
 */
createContent.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { categoryId, title, content, isDone, id } = req.body;
    if (handleCheckRequired({ categoryId, title, content, isDone, id })) {
      return res.json(Results[130]);
    }

    /* 1. 컨텐트 존재 여부 */
    let contents: null | Array<Content> = null;
    try {
      contents = await handleSql(SELECT_CONTENTS_BY_TITLE({ title }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(contents) && contents.length > 0) {
      /* 2. 이미 존재하는 타이틀 */
      return res.json(Results[110]);
    } else {
      /* 3. 없는 타이틀 */
      try {
        await handleSql(
          INSERT_CONTENT({
            categoryId,
            title,
            content,
            id,
            isDone,
            create_dt: handleGetLocaleTime('db')
          })
        );
      } catch (e: any) {
        return next(new Error(e.stack));
      }
    }

    return res.json({ ...Results[0] });
  }
);
