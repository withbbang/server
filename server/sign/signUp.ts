// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';
import { Results } from '../../enums/Results';

// 모듈 임포트
import { handleCheckRequired, handleGetLocaleTime } from '../../modules/common';
import {
  handleCreateSalt,
  handleCreateSha512,
  handleRSADecrypt,
  privateKey
} from '../../modules/crypto';
import { handleSql } from '../../modules/oracleSetting';
import { SELECT_USER, INSERT_USER } from '../../queries/sign';
import { User } from '../../types/User';

export const signUp: Router = Router();

/**
 * 회원가입
 * @param id        관리자 아이디
 * @param password  관리자 비밀번호
 */
signUp.post(
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

    /* 1. 회원 존재 여부 확인 */
    let users: null | Array<User> = null;
    try {
      users = await handleSql(SELECT_USER({ id }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(users) && users.length > 0) {
      return res.json(Results[110]);
    } else {
      /* 2. 비밀번호 RSA 복호화 */
      let decrypted: string = '';
      try {
        decrypted = handleRSADecrypt(req.body.password, privateKey);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 3. salt 생성 */
      let salt: string = '';
      try {
        salt = handleCreateSalt();
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 4. 비밀번호 해쉬화 */
      let password: string = '';
      try {
        password = salt && handleCreateSha512(decrypted, salt);
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      /* 5. 회원 추가 */
      try {
        password &&
          salt &&
          (await handleSql(
            INSERT_USER({
              id,
              password,
              salt,
              auth: 30,
              create_dt: handleGetLocaleTime('db')
            })
          ));
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      return res.json(Results[0]);
    }
  }
);
