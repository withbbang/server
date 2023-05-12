// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';

// 모듈 임포트
import { Results } from '../../enums/Results';
import {
  SELECT_HEARTS_COUNT_ISHEART,
  SELECT_ISHEART,
  INSERT_HEART,
  DELETE_HEART
} from '../../queries/common';
import { handleSql } from '../../modules/oracleSetting';
import { Heart } from '../../types/Heart';
import { handleCheckRequired } from '../../modules/common';

export const heart: Router = Router();
export const set: Router = Router();

heart.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { contentId } = req.body;
    if (handleCheckRequired({ contentId })) {
      return res.json(Results[130]);
    }

    const ip: string | string[] | undefined =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    let heart: Array<Heart>;

    /* 1. 좋아요 정보 가져오기 */
    try {
      heart = await handleSql(SELECT_HEARTS_COUNT_ISHEART({ ip, contentId }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2. 좋아요 정보 반환 */
    return res.json({ ...Results[0], heart: heart[0] });
  }
);

set.post(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 0. 필수값 존재 확인 */
    const { contentId } = req.body;
    if (handleCheckRequired({ contentId })) {
      return res.json(Results[130]);
    }

    const ip: string | string[] | undefined =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    let isHeart: Array<string>;

    /* 1. 좋아요 눌렀는지 확인 */
    try {
      isHeart = await handleSql(SELECT_ISHEART({ ip, contentId }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    if (Array.isArray(isHeart) && isHeart.length > 0) {
      /* 2. 좋아요 이미 눌렀을 경우 */
      try {
        isHeart = await handleSql(DELETE_HEART({ ip, contentId }));
      } catch (e: any) {
        return next(new Error(e.stack));
      }
    } else {
      /* 3. 좋아요 안 눌렀을 경우 */
      try {
        isHeart = await handleSql(INSERT_HEART({ ip, contentId }));
      } catch (e: any) {
        return next(new Error(e.stack));
      }
    }

    /* 4. 갱신된 좋아요 정보 가져오기 */
    //TODO: 디도스 우려가 있으므로 화면에서만 갱신되도록 해야할 수도 있음
    let heart: Array<Heart>;
    try {
      heart = await handleSql(SELECT_HEARTS_COUNT_ISHEART({ ip, contentId }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    /* 2. 좋아요 정보 반환 */
    return res.json({ ...Results[0], heart: heart[0] });
  }
);
