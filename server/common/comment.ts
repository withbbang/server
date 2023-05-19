// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import {
  SELECT_COMMENTS,
  INSERT_COMMENT,
  SELECT_CONTENT_FOR_EXISTS,
  SELECT_COMMENT_FOR_EXISTS,
  UPDATE_COMMENT,
  DELETE_COMMENT
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
export const updateCommentPage: Router = Router();
export const updateComment: Router = Router();
export const deleteComment: Router = Router();

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
    if (
      handleCheckRequired({ nickName, password, contentId, comments, isSecret })
    ) {
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

updateCommentPage.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { commentId, password } = req.body;
    if (handleCheckRequired({ commentId, password })) {
      return res.json(Results[130]);
    }

    /* 1. 댓글이 유효한지 검사 */
    let comments: null | Array<Comment> = null;
    try {
      comments = await handleSql(SELECT_COMMENT_FOR_EXISTS({ id: commentId }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2. 댓글이 있을 경우 */
    if (Array.isArray(comments) && comments.length > 0) {
      const comment: Comment = comments[0];

      /* 3. 비밀번호 복호화 */
      let decrypted: string = '';
      try {
        decrypted = handleRSADecrypt(password, privateKey);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 4. 비밀번호 해쉬 */
      let hash: string = '';
      try {
        hash = handleCreateSha512(decrypted, '');
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 5. 비밀번호 같을 경우 */
      if (hash === comment.PASSWORD) {
        /* 6. 댓글 수정 페이지로 */
        return res.redirect('/comment/update/' + commentId);
      } else {
        /* 7. 비밀번호 다를 경우 */
        return res.json({ ...Results[20] });
      }
    } else {
      /* 8. 댓글이 없을 경우 */
      return res.json({ ...Results[120] });
    }
  }
);

updateComment.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    let { contentId, id, nickName, password, comments, isSecret } = req.body;
    if (
      handleCheckRequired({
        contentId,
        id,
        nickName,
        password,
        comments,
        isSecret
      })
    ) {
      return res.json(Results[130]);
    }

    const ip: string | string[] | undefined =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    /* 1. 댓글이 유효한지 검사 */
    let commentsFromDB: null | Array<Comment> = null;
    try {
      commentsFromDB = await handleSql(SELECT_COMMENT_FOR_EXISTS({ id }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2. 댓글이 있을 경우 */
    if (Array.isArray(commentsFromDB) && commentsFromDB.length > 0) {
      const commentFromDB: Comment = commentsFromDB[0];

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

      /* 4. 변한 값들만 갱신하도록 구분, 모든 값을 write 하기엔 DB의 부담이 크기 때문이다.*/
      let shouldbeUpdated = false;

      if (nickName !== commentFromDB.NICKNAME) {
        shouldbeUpdated = true;
      } else {
        nickName = '';
      }

      if (hash !== commentFromDB.PASSWORD) {
        shouldbeUpdated = true;
      } else {
        hash = '';
      }

      if (isSecret !== commentFromDB.IS_SECRET) {
        shouldbeUpdated = true;
      } else {
        isSecret = '';
      }

      if (comments !== commentFromDB.COMMENTS) {
        shouldbeUpdated = true;
      } else {
        comments = '';
      }

      /* 4-1. 요청값이 모두 동일할 경우 */
      if (!shouldbeUpdated) {
        return res.json(Results[150]);
      }

      /* 5. 댓글 갱신 */
      try {
        await handleSql(
          UPDATE_COMMENT({
            id,
            ip,
            nickName,
            password: hash,
            comments,
            update_dt: handleGetLocaleTime('db'),
            isSecret
          })
        );
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 6. 새 댓글들 가져오기 */
      let newComments: null | Array<Comment> = null;
      try {
        newComments = await handleSql(SELECT_COMMENTS({ contentId }));
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      return res.json({ ...Results[0], comments: newComments });

      /* 7. 댓글들 없을 경우 */
    } else {
      return res.json({ ...Results[120] });
    }
  }
);

deleteComment.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { commentId, password } = req.body;
    if (handleCheckRequired({ commentId, password })) {
      return res.json(Results[130]);
    }

    /* 1. 댓글이 유효한지 검사 */
    let comments: null | Array<Comment> = null;
    try {
      comments = await handleSql(SELECT_COMMENT_FOR_EXISTS({ id: commentId }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2. 댓글이 있을 경우 */
    if (Array.isArray(comments) && comments.length > 0) {
      const comment: Comment = comments[0];

      /* 3. 비밀번호 복호화 */
      let decrypted: string = '';
      try {
        decrypted = handleRSADecrypt(password, privateKey);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 4. 비밀번호 해쉬 */
      let hash: string = '';
      try {
        hash = handleCreateSha512(decrypted, '');
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 5. 비밀번호 같을 경우 */
      if (hash === comment.PASSWORD) {
        /* 6. 댓글 삭제 */
        try {
          await handleSql(
            DELETE_COMMENT({
              commentId,
              delete_dt: handleGetLocaleTime('db')
            })
          );
        } catch (e: any) {
          return next(new Error(e.stack));
        }

        return res.json({ ...Results[0] });
      } else {
        /* 7. 비밀번호 다를 경우 */
        return res.json({ ...Results[20] });
      }
    } else {
      /* 8. 댓글이 없을 경우 */
      return res.json({ ...Results[120] });
    }
  }
);
