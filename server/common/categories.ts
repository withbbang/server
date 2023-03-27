// 라이브러리 임포트
import { NextFunction, Request, Response, Router } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// 모듈 임포트
import { Results } from '../../enums/Results';
import { Category } from '../../types/Category';
import { User } from '../../types/User';
import { handleSql } from '../../modules/oracleSetting';
import { SELECT_CATEGORIES, SELECT_USER } from '../../queries/select';

/* Token 생성 및 검증용 key */
const jwtKey = process.env.jwtKey as string;

export const categories: Router = Router();

/**
 * 사용자별 카테고리 목록 가져오기
 */
categories.get(
  '/',
  async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>> {
    /* 1. 요청 헤더에 토큰 존재 여부 확인 */
    let token: string = '';
    if (req.headers.authorization) {
      token = req.headers.authorization.split('Bearer ')[1];
    }

    /* 2. 토큰에서 유저 ID 빼오기 */
    let decoded: JwtPayload | undefined = undefined;
    try {
      decoded = jwt.verify(token, jwtKey) as JwtPayload;
    } catch (e: any) {
      console.log('Error: ', e);
    }

    /* 2 AUTH 설정 */
    let auth: number | undefined = decoded && decoded.auth;

    /* 3. 카테고리들 가져오기 */
    let categories: null | Array<Category> = null;
    try {
      categories = await handleSql(SELECT_CATEGORIES({ auth }));
    } catch (e: any) {
      return next(new Error(e.stack));
    }

    return res.json({ ...Results[0], categories });
  }
);
