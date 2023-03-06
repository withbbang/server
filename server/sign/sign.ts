import { Request, Response, Router } from 'express';

import { handleGetLocaleTime, handleSetParser } from '../../modules/common';
import {
  handleCreateSalt,
  handleCreateSha512,
  handleRSADecrypt,
  publicKey,
  privateKey
} from '../../modules/crypto';
import { handleSql } from '../../modules/oracleSetting';
import { Users } from '../../modules/testUser';
import { INSERT_USER } from '../../queries/insert';
import { SELECT_USER } from '../../queries/select';

export const sign: Router = Router();

handleSetParser(sign);

sign.get('/', function (req: Request, res: Response): void {
  console.log(publicKey, privateKey);

  res.send({ key: 'hello' });
});

sign.post('/up', async function (req: Request, res: Response): Promise<void> {
  let length: number = 0;

  try {
    const user = await handleSql(SELECT_USER, { id: req.body.id });
    length = user.length;
  } catch (e) {
    console.error('Error finding user: ', e);
    res.send({ result: 'bad' });
    throw Error();
  }

  if (length > 0) {
    res.send({ result: '이미 있는 유저다.' });
  } else {
    const salt: string = handleCreateSalt();
    const password: string = handleCreateSha512(
      handleRSADecrypt(req.body.password, ''),
      salt
    );

    try {
      await handleSql(INSERT_USER, {
        id: req.body.id,
        password,
        salt,
        auth: 30,
        createdt: handleGetLocaleTime('db')
      });

      res.send({ result: 'ok' });
    } catch (e) {
      console.error('Error inserting user: ', e);
      res.send({ result: 'bad' });
      throw Error();
    }
  }
});

sign.post('/in', function (req: Request, res: Response) {
  const user = Users.find((user: any) => user.id === req.body.id);

  if (user) {
    const salt: string = user.salt;
    const sha512: string = handleCreateSha512(req.body.password, salt);
    if (sha512 === user.sha512) {
      res.send({ result: '로그인 완료.' });
    } else {
      res.send({ result: '비밀번호 틀림.' });
    }
  } else {
    res.send({ result: '없는 유저다.' });
  }
});
