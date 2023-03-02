import express, { Request, Response, Router } from 'express';
import {
  handleCreateSalt,
  handleCreateSha512,
  handleRSADecrypt
} from '../../modules/crypto';
import { Users } from '../../modules/testUser';

export const sign: Router = Router();

sign.use(express.json());
sign.use(express.urlencoded({ extended: true }));

sign.post('/up', (req: Request, res: Response) => {
  const user = Users.find((user: any) => user.id === req.body.id);

  if (user) {
    res.send({ result: '이미 있는 유저다.' });
  } else {
    const salt = handleCreateSalt();
    // const password = handleRSADecrypt(
    //   req.body.password,
    //   req.body.publicKey
    // );
    const sha512 = handleCreateSha512(req.body.password, salt);

    Users.push({ id: req.body.id, sha512, salt });
    console.log('Users: ', Users);

    res.send({ result: 'ok' });
  }
});

sign.post('/in', (req: Request, res: Response) => {
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
