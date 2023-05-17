// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import {
  SELECT_COMMENTS,
  INSERT_COMMENT,
  SELECT_CONTENT_FOR_EXISTS
} from '../../queries/common';
import { handleSql } from '../../modules/oracleSetting';
import { handleCheckRequired, handleGetLocaleTime } from '../../modules/common';
import { Comment } from '../../types/Comment';
import {
  handleCreateSha512,
  handleRSADecrypt,
  privateKey
} from '../../modules/crypto';
import { Content } from '../../types/Content';

export const comments: Router = Router();
export const createComment: Router = Router();

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

createComment.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { refId, nickName, password, contentId, comments, isSecret } =
      req.body;
    if (handleCheckRequired({ nickName, password, contentId, comments })) {
      return res.json(Results[130]);
    }

    const ip: string | string[] | undefined =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    /* 1. 컨텐트가 유효한지 검사 */
    let contents: null | Array<Content> = null;
    try {
      contents = await handleSql(SELECT_CONTENT_FOR_EXISTS({ contentId }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2. 컨텐츠 있을 경우 */
    if (Array.isArray(contents) && contents.length > 0) {
      /* 2. 비밀번호 복호화 */
      let decrypted: string = '';
      try {
        decrypted = handleRSADecrypt(password, privateKey);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 3. 비밀번호 해쉬 */
      let hash: string = '';
      try {
        hash = handleCreateSha512(decrypted, '');
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 4. 코멘트 생성 */
      try {
        await handleSql(
          INSERT_COMMENT({
            ip,
            nickName,
            password: hash,
            contentId,
            comments,
            create_dt: handleGetLocaleTime('db'),
            isSecret,
            refId
          })
        );
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 5. 새 댓글들 가져오기 */
      let newComments: null | Array<Comment> = null;
      try {
        newComments = await handleSql(SELECT_COMMENTS({ contentId }));
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      return res.json({ ...Results[0], comments: newComments });

      /* 3. 컨텐츠 없을 경우 */
    } else {
      return res.json({ ...Results[120] });
    }
  }
);
