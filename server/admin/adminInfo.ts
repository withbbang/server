// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import { User } from '../../types/User';
import { SELECT_USER } from '../../queries/select';
import { handleSql } from '../../modules/oracleSetting';

export const adminInfo: Router = Router();

/**
 * 로그인한 관리자 정보
 * @param id    관리자 아이디
 */
adminInfo.get(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    const id = req.body.id;
    /* 1. 요청 헤더에 토큰 존재 여부 확인 */
    let token: string = '';
    if (req.headers.authorization) {
      token = req.headers.authorization.split('Bearer ')[1];
    } else {
      return res.json(Results[40]);
    }

    /* 2. 회원 존재 여부 확인 */
    let users: null | Array<User> = null;
    try {
      users = await handleSql(SELECT_USER, { id });
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    let accessToken: string | undefined = '';
    if (Array.isArray(users) && users.length > 0) {
      /* 3. 유저 존재 */
      const user = users[0];

      /* 3-1. AccessToken 일치 확인 */
      accessToken = user.ACCESS_TOKEN;
      if (accessToken !== token) {
        return res.json(Results[60]);
      }

      return res.json({ ...Results[0], id: user.ID, auth: user.AUTH });
    } else {
      /* 4. 유저 미존재 */
      return res.json(Results[30]);
    }
  }
);
