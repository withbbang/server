import { Request, Response, Router } from 'express';
import { handleGetLocaleTime, handleSetBodyParser } from '../../modules/common';
import {
  handleCreateSalt,
  handleCreateSha512,
  handleRSADecrypt
} from '../../modules/crypto';
import { handleSql } from '../../modules/oracleSetting';
import { Users } from '../../modules/testUser';
import { INSERT_USER } from '../../queries/insert';

export const sign: Router = Router();

handleSetBodyParser(sign);

sign.post('/up', function (req: Request, res: Response) {
  const user = Users.find((user: any) => user.id === req.body.id);

  if (user) {
    res.send({ result: '이미 있는 유저다.' });
  } else {
    const salt = handleCreateSalt();
    const password = handleCreateSha512(req.body.password, salt);

    handleSql(INSERT_USER, {
      id: req.body.id,
      password,
      salt,
      auth: 0,
      createdt: handleGetLocaleTime('db')
    });

    res.send({ result: 'ok' });
  }
});

sign.post('/in', function (req: Request, res: Response) {
  const user = Users.find((user: any) => user.id === req.body.id);

  if (user) {
    const salt = user.salt;
    const sha512 = handleCreateSha512(req.body.password, salt);
    if (sha512 === user.sha512) {
      res.send({ result: '로그인 완료.' });
    } else {
      res.send({ result: '비밀번호 틀림.' });
    }
  } else {
    res.send({ result: '없는 유저다.' });
  }
});
