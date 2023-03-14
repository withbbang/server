import { NextFunction, Request, Response, Router } from 'express';

import { handleSql } from '../../modules/oracleSetting';
import { SELECT_USER } from '../../queries/select';
import { UPDATE_USER_LOGOUT } from '../../queries/update';
import { User } from '../../types/User';

export const logOut: Router = Router();

/**
 * 로그아웃
 * @param id        회원 아이디
 * @param password  회원 비밀번호
 */
logOut.post(
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
      return res.json({ message: 'No authorization' });
    }
    let users: null | Array<User> = null;

    const id: string = req.body.id;

    /* 2. 회원 존재 여부 확인 */
    try {
      users = await handleSql(SELECT_USER, { id });
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    let accessToken: string | undefined = '';
    if (Array.isArray(users) && users.length > 0) {
      /* 3. 유저 존재 */
      accessToken = users[0].ACCESS_TOKEN;

      /* 3-1. AccessToken 일치 확인 */
      if (accessToken !== token) {
        return res.json({ message: 'Unmatch access token' });
      }
    } else {
      /* 4. 유저 미존재 */
      return res.json({ message: 'No user' });
    }

    /* 5. 유저 로그아웃 갱신 */
    try {
      await handleSql(UPDATE_USER_LOGOUT, {
        id
      });
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    //TODO: 클라이언트에서 쿠키에 access refresh token 회수 로직 필요
    res.json({ message: 'Logout success' });
  }
);
