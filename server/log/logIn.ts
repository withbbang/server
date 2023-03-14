import { NextFunction, Request, Response, Router } from 'express';

import {
  handleCreateSha512,
  handleRSADecrypt,
  privateKey
} from '../../modules/crypto';
import { issueAccessToken, issueRefreshToken } from '../../modules/jwt';
import { handleSql } from '../../modules/oracleSetting';
import { SELECT_USER } from '../../queries/select';
import { UPDATE_USER_LOGIN } from '../../queries/update';
import { User } from '../../types/User';

export const logIn: Router = Router();

/**
 * 로그인
 * @param id        회원 아이디
 * @param password  회원 비밀번호
 */
logIn.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    let users: null | Array<User> = null;

    const id: string = req.body.id;

    /* 1. 회원 존재 여부 확인 */
    try {
      users = await handleSql(SELECT_USER, { id });
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2-1. 유저 존재 */
    if (Array.isArray(users) && users.length > 0) {
      const user = users[0];
      const salt: string = user.SALT;

      /* 2-1-1. 비밀번호 복호화 */
      let decrypted: string = '';
      try {
        decrypted = handleRSADecrypt(req.body.password, privateKey);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 2-1-2. 비밀번호 hash화 */
      let password: string = '';
      try {
        password = salt && handleCreateSha512(decrypted, salt);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 2-1-3. 비밀번호 일치 -> 토큰발행 */
      if (password === user.PASSWORD) {
        let accessToken = '';
        let refreshToken = '';
        try {
          accessToken = issueAccessToken(id, user.AUTH);
          refreshToken = issueRefreshToken();
        } catch (e: any) {
          return next(new Error(e.stack));
        }

        /* 2-1-4. 유저 로그인 갱신 */
        try {
          await handleSql(UPDATE_USER_LOGIN, {
            accessToken,
            refreshToken,
            id,
            salt,
            password
          });
        } catch (e: any) {
          return next(new Error(e.stack));
        }

        /* 2-1-5. 헤더설정 및 응답 */
        res.json({ message: 'Login success', accessToken, refreshToken });

        /* 2-2. 비밀번호 미일치 */
      } else {
        return res.json({ message: 'Wrong password.' });
      }

      /* 3. 유저 미존재 */
    } else {
      return res.json({ message: '없는 유저다.' });
    }
  }
);
