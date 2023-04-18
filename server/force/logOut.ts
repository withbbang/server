// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';
import { Results } from '../../enums/Results';

// 모듈 임포트
import { handleSql } from '../../modules/oracleSetting';
import { SELECT_USER, UPDATE_USER_LOGOUT } from '../../queries/force';
import { User } from '../../types/User';
import { handleCheckRequired } from '../../modules/common';

export const logOut: Router = Router();

/**
 * 강제 로그아웃
 * @param id        관리자 아이디
 * @param password  관리자 비밀번호
 */

logOut.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { id } = req.body;
    if (handleCheckRequired({ id })) {
      return res.json(Results[130]);
    }

    let users: null | Array<User> = null;
    /* 1. 회원 존재 여부 확인 */
    try {
      users = await handleSql(SELECT_USER({ id }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2. 유저 로그아웃 갱신 */
    try {
      await handleSql(UPDATE_USER_LOGOUT({ id }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    res.clearCookie('atk');
    res.clearCookie('rtk');
    return res.json(Results[0]);
  }
);
