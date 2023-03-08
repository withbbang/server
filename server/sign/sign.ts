import { NextFunction, Request, Response, Router } from 'express';

import { handleCatchClause, handleGetLocaleTime } from '../../modules/common';
import {
  handleCreateSalt,
  handleCreateSha512,
  handleRSADecrypt,
  privateKey
} from '../../modules/crypto';
import { handleSql } from '../../modules/oracleSetting';
import { INSERT_USER } from '../../queries/insert';
import { SELECT_USER } from '../../queries/select';

export const sign: Router = Router();

sign.get('/', function (req: Request, res: Response): void {
  res.send({ key: 'hello' });
});

sign.post('/', function (req: Request, res: Response): void {
  console.log('body: ', req.body);
  res.send({ key: 'hello' });
});

sign.post(
  '/up',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let length: number = 0;

    try {
      const user = await handleSql(SELECT_USER, { id: req.body.id });
      length = user.length;
    } catch (e: any) {
      handleCatchClause('N', e, e.message, next);
    }

    if (length > 0) {
      res.send({ result: '이미 있는 유저다.' });
    } else {
      let decrypted: string = '';
      try {
        decrypted = handleRSADecrypt(req.body.password, privateKey);
      } catch (e: any) {
        handleCatchClause('N', e, e.message, next);
      }

      let salt: string = '';
      try {
        salt = handleCreateSalt();
      } catch (e: any) {
        handleCatchClause('N', e, e.message, next);
      }

      let password: string = '';
      try {
        password = salt && handleCreateSha512(decrypted, salt);
      } catch (e: any) {
        handleCatchClause('N', e, e.message, next);
      }

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

sign.post(
  '/in',
  async function (req: Request, res: Response, next: NextFunction) {
    let user = null;

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
