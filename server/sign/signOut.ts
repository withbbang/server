// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { handleCheckRequired, handleGetLocaleTime } from '../../modules/common';
import {
  handleCreateSha512,
  handleRSADecrypt,
  privateKey
} from '../../modules/crypto';
import { handleSql } from '../../modules/oracleSetting';
import { SELECT_USER, UPDATE_USER_WITHDRAW } from '../../queries/sign';
import { User } from '../../types/User';
import { Results } from '../../enums/Results';

export const signOut: Router = Router();

/**
 * 회원탈퇴
 * @param id        관리자 아이디
 * @param password  관리자 비밀번호
 */
signOut.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { id, password } = req.body;
    if (handleCheckRequired({ id, password })) {
      return res.json(Results[130]);
    }

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
      users = await handleSql(SELECT_USER({ id }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    let accessToken: string | undefined = '';
    if (Array.isArray(users) && users.length > 0) {
      /* 3. 유저 존재 */
      const user = users[0];
      const salt: string = user.SALT;

      /* 3-1. 비밀번호 복호화 */
      let decrypted: string = '';
      try {
        decrypted = handleRSADecrypt(req.body.password, privateKey);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 3-2. 비밀번호 hash화 */
      let password: string = '';
      try {
        password = salt && handleCreateSha512(decrypted, salt);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 3-3. 비밀번호 일치 확인 */
      if (password !== user.PASSWORD) {
        return res.json(Results[20]);
      }

      /* 3-4. AccessToken 일치 확인 */
      accessToken = user.ACCESS_TOKEN;
      if (accessToken !== token) {
        return res.json(Results[60]);
      }
    } else {
      /* 4. 유저 미존재 */
      return res.json(Results[30]);
    }

    /* 5. 유저 로그아웃 갱신 */
    try {
      await handleSql(
        UPDATE_USER_WITHDRAW({
          id,
          update_dt: handleGetLocaleTime('db'),
          delete_dt: handleGetLocaleTime('db')
        })
      );
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    res.clearCookie('atk');
    res.clearCookie('rtk');
    return res.json(Results[0]);
    // return res.redirect('/');
  }
);
