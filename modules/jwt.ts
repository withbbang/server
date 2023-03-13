import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { SELECT_USER } from '../queries/select';
import { User } from '../types/User';
import { handleSql } from './oracleSetting';

/* Token 생성 및 검증용 key */
const jwtKey = 'breadkimismacho';

/* AccessToken 생성함수 */
function issueAccessToken(id: string, auth: number): string {
  const payload = {
    id,
    auth
  };

  let accessToken = '';

  /* AccessToken 생성 */
  try {
    accessToken = jwt.sign(payload, jwtKey, {
      expiresIn: '2h',
      algorithm: 'HS512'
    });
  } catch (e: any) {
    throw new Error(e.stack);
  }

  return accessToken;
}

/* AccessToken 검증함수 */
async function verifyAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  /* 1. 요청 헤더에 토큰 존재 여부 확인 */
  let token: string = '';
  if (req.headers.authorization) {
    token = req.headers.authorization.split('Bearer ')[1];
  } else {
    return res.json({ message: 'No authorization' });
  }

  /* 2. 회원 존재 여부 확인 */
  let user: null | User = null;
  let accessToken: string | undefined = '';
  try {
    user = await handleSql(SELECT_USER, { id: req.body.id });
    accessToken = user?.ACCESS_TOKEN;
  } catch (e: any) {
    return next(new Error(e.stack));
  }

  /* 3. AccessToken 일치 확인 */
  if (accessToken !== token) {
    return res.json({ message: 'Unmatch access token' });
  }

  /* 4. 토큰 검증 */
  let result: string | JwtPayload = '';
  try {
    result = jwt.verify(token, jwtKey);
  } catch (e: any) {
    if (e.name === 'TokenExpiredError') {
      req.body.requiredRefresh = 'Y';
      return next();
    } else {
      return next(new Error(e.stack));
    }
  }

  return next();
}

/* RefreshToken 생성 */
function issueRefreshToken(): string {
  let refreshToken = '';

  try {
    refreshToken = jwt.sign({}, jwtKey, {
      expiresIn: '14d',
      algorithm: 'HS512'
    });
  } catch (e: any) {
    throw new Error(e.stack);
  }

  return refreshToken;
}

/* RefreshToken 검증 */
async function verifyRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  /* 1. 회원 존재 여부 확인 */
  let user: null | User = null;
  let accessToken: string | undefined = '';
  let refreshToken: string | undefined = '';
  try {
    user = await handleSql(SELECT_USER, { id: req.body.id });
    accessToken = user?.ACCESS_TOKEN;
    refreshToken = user?.REFRESH_TOKEN;
  } catch (e: any) {
    return next(new Error(e.stack));
  }

  /* 2. 요청 헤더에 토큰 존재 여부 확인 */
}

export {
  issueAccessToken,
  verifyAccessToken,
  issueRefreshToken,
  verifyRefreshToken
};
