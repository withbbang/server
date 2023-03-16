// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';
import { Results } from '../../enums/Results';

// 모듈 임포트
import { handleGetLocaleTime } from '../../modules/common';
import {
  handleCreateSalt,
  handleCreateSha512,
  handleRSADecrypt,
  privateKey
} from '../../modules/crypto';
import { handleSql } from '../../modules/oracleSetting';
import { INSERT_USER } from '../../queries/insert';
import { SELECT_USER } from '../../queries/select';
import { User } from '../../types/User';

export const signUp: Router = Router();

/**
 * 회원가입
 * @param id        회원 아이디
 * @param password  회원 비밀번호
 */
signUp.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    let users: null | Array<User> = null;

    /* 1. 회원 존재 여부 확인 */
    try {
      users = await handleSql(SELECT_USER, { id: req.body.id });
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(users) && users.length > 0) {
      res.send({ message: '이미 있는 유저다.' });
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
          (await handleSql(INSERT_USER, {
            id: req.body.id,
            password,
            salt,
            auth: 30,
            createdt: handleGetLocaleTime('db')
          }));
      } catch (e: any) {
        return next(new Error(e.stack));
      }

      return res.json(Results[0]);
    }
  }
);
