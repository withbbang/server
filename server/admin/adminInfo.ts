// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// 모듈 임포트
import { Results } from '../../enums/Results';
import { User } from '../../types/User';
import { SELECT_USER } from '../../queries/select';
import { handleSql } from '../../modules/oracleSetting';
import { handleVerifyToken } from '../../modules/jwt';

export const adminInfo: Router = Router();

/**
 * 로그인한 관리자 정보
 * @param id    관리자 아이디
 */
//TODO: body에 id 넘길 방법 모색 필요
adminInfo.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 1. 요청 헤더에 토큰 존재 여부 확인 */
    let token: string = '';
    if (req.headers.authorization) {
      token = req.headers.authorization.split('Bearer ')[1];
    } else {
      res.clearCookie('atk');
      res.clearCookie('rtk');
      return res.json(Results[40]);
    }

    let decoded: JwtPayload;
    try {
      decoded = handleVerifyToken(token);
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2. 회원 존재 여부 확인 */
    let users: null | Array<User> = null;
    try {
      users = await handleSql(SELECT_USER({ id: decoded.id }));
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
        res.clearCookie('atk');
        res.clearCookie('rtk');
        return res.json(Results[60]);
      }

      return res.json({ ...Results[0], id: user.ID, auth: user.AUTH });
    } else {
      /* 4. 유저 미존재 */
      res.clearCookie('atk');
      res.clearCookie('rtk');
      return res.json(Results[30]);
    }
  }
);
