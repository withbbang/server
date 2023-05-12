// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import { SELECT_COMMENTS } from '../../queries/common';
import { handleSql } from '../../modules/oracleSetting';
import { handleCheckRequired } from '../../modules/common';
import { Comment } from '../../types/Comment';

export const comments: Router = Router();

comments.get(
  '/:contentId',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    const contentId = req.params.contentId;

    /* 1. 댓글들 가져오기 */
    let comments: null | Array<Comment> = null;
    try {
      comments = await handleSql(SELECT_COMMENTS({ contentId }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    return res.json({ ...Results[0], comments });
  }
);
