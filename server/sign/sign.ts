import { NextFunction, Request, Response, Router } from 'express';

import { handleGetLocaleTime } from '../../modules/common';
import {
  handleCreateSalt,
  handleCreateSha512,
  handleRSADecrypt,
  publicKey,
  privateKey
} from '../../modules/crypto';
import { issueAccessToken, issueRefreshToken } from '../../modules/jwt';
import { handleSql } from '../../modules/oracleSetting';
import { INSERT_USER } from '../../queries/insert';
import { SELECT_USER } from '../../queries/select';
import { UPDATE_USER_LOGIN } from '../../queries/update';
import { User } from '../../types/User';

export const sign: Router = Router();

sign.get('/', function (req: Request, res: Response): void {
  res.json({ publicKey });
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
      return next(new Error(e.stack));
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
    let user: null | User = null;

    /* 1. 회원 존재 여부 확인 */
    try {
      user = await handleSql(SELECT_USER, { id: req.body.id });
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (user) {
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

      res.json({ message: 'ok' });
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
    let user: null | User = null;

    const id = req.body.id;

    /* 1. 회원 존재 여부 확인 */
    try {
      user = await handleSql(SELECT_USER, { id });
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2-1. 유저 존재 */
    if (user) {
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
          accessToken = issueAccessToken(req.body.id, user.AUTH);
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
        res.setHeader('Authorization', 'Bearer ' + accessToken);
        res.setHeader('Refresh', 'Bearer ' + refreshToken);
        res.json({ message: 'Login success' });

        /* 비밀번호 미일치 */
      } else {
        return res.json({ message: 'Wrong password.' });
      }

      /* 2-2. 유저 미존재 */
    } else {
      return res.json({ message: '없는 유저다.' });
    }
  }
);
