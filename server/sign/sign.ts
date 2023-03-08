import { NextFunction, Request, Response, Router } from 'express';

import { handleCatchClause, handleGetLocaleTime } from '../../modules/common';
import {
  handleCreateSalt,
  handleCreateSha512,
  handleRSADecrypt,
  publicKey,
  privateKey
} from '../../modules/crypto';
import { handleSql } from '../../modules/oracleSetting';
import { INSERT_USER } from '../../queries/insert';
import { SELECT_USER } from '../../queries/select';

export const sign: Router = Router();

sign.get('/', function (req: Request, res: Response): void {
  res.send({ key: publicKey });
});

sign.post(
  '/',
  function (req: Request, res: Response, next: NextFunction): void {
    const data = req.body.data;
    console.log('data: ', data);

    let decrypted;
    try {
      decrypted = handleRSADecrypt(data, privateKey);
      console.log('decrypted: ', decrypted);
    } catch (e: any) {
      handleCatchClause('N', e, e.message, next);
    }

    res.send({ decrypted });
  }
);

/**
 * 회원가입
 * @param id        회원 아이디
 * @param password  회원 비밀번호
 */
sign.post(
  '/up',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let length: number = 0;

    /* 1. 회원 존재 여부 확인 */
    try {
      const user = await handleSql(SELECT_USER, { id: req.body.id });
      length = user.length;
    } catch (e: any) {
      handleCatchClause('N', e, e.message, next);
    }

    if (length > 0) {
      res.send({ result: '이미 있는 유저다.' });
    } else {
      /* 2. 비밀번호 RSA 복호화 */
      let decrypted: string = '';
      try {
        decrypted = handleRSADecrypt(req.body.password, privateKey);
      } catch (e: any) {
        handleCatchClause('N', e, e.message, next);
      }

      /* 3. salt 생성 */
      let salt: string = '';
      try {
        salt = handleCreateSalt();
      } catch (e: any) {
        handleCatchClause('N', e, e.message, next);
      }

      /* 4. 비밀번호 해쉬화 */
      let password: string = '';
      try {
        password = salt && handleCreateSha512(decrypted, salt);
      } catch (e: any) {
        handleCatchClause('N', e, e.message, next);
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
        handleCatchClause('N', e, e.message, next);
      }

      res.send({ result: 'ok' });
    }
  }
);

/**
 * 로그인
 * @param id        회원 아이디
 * @param password  회원 비밀번호
 */
sign.post(
  '/in',
  async function (req: Request, res: Response, next: NextFunction) {
    let user = null;

    /* 1. 회원 존재 여부 확인 */
    try {
      user = await handleSql(SELECT_USER, { id: req.body.id });
    } catch (e: any) {
      handleCatchClause('N', e, e.message, next);
    }

    if (user.length > 0) {
      const salt: string = user[0].salt;
      const password: string = handleCreateSha512(
        handleRSADecrypt(req.body.password, privateKey),
        salt
      );
      if (password === user[0].password) {
        //TODO: 토큰 생성
        res.send({ result: '로그인 완료.' });
      } else {
        //TODO: 에러
        res.send({ result: '비밀번호 틀림.' });
      }
    } else {
      //TODO: 에러
      res.send({ result: '없는 유저다.' });
    }
  }
);
