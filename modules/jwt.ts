// 라이브러리 임포트
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// 모듈 임포트
import { cookieConfig } from '../config/config';
import { SELECT_USER } from '../queries/select';
import { UPDATE_USER_ACCESS_TOKEN } from '../queries/update';
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
  let users: null | Array<User> = null;
  try {
    users = await handleSql(SELECT_USER, { id: req.body.id });
  } catch (e: any) {
    return next(new Error(e.stack));
  }

  let accessToken: string | undefined = '';
  if (Array.isArray(users) && users.length > 0) {
    /* 3. 유저 존재 */
    accessToken = users[0].ACCESS_TOKEN;

    /* 3-1. AccessToken 일치 확인 */
    if (accessToken !== token) {
      return res.json({ message: 'Unmatch access token' });
    }
  } else {
    /* 4. 유저 미존재 */
    return res.json({ message: 'No user' });
  }

  /* 4. 토큰 검증 */
  let result: string | JwtPayload = '';
  try {
    result = jwt.verify(token, jwtKey);
  } catch (e: any) {
    if (e.name === 'TokenExpiredError') {
      /* 4-1. 토큰 만료시 재발급 */
      req.body.requiredRefresh = 'Y';
      return next();
    } else {
      /* 4-2. 다른 에러일 경우 넘기기 */
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
  /* 1. access token 만료일 경우에만 로직 태우기 */
  if (req.body.requiredRefresh !== 'Y') {
    return next();
  }

  /* 2. 요청 헤더에 토큰 존재 여부 확인 */
  let token: string = '';
  let refresh = req.headers.Refresh as string | undefined;
  if (refresh) {
    token = refresh.split('Bearer ')[1];
  } else {
    return res.json({ message: 'No Refresh' });
  }

  const id = req.body.id;

  /* 3. 회원 존재 여부 확인 */
  let users: null | Array<User> = null;
  try {
    users = await handleSql(SELECT_USER, { id });
  } catch (e: any) {
    return next(new Error(e.stack));
  }

  let refreshToken: string | undefined = '';
  if (Array.isArray(users) && users.length > 0) {
    /* 4. 유저 존재 */
    refreshToken = users[0].REFRESH_TOKEN;

    /* 4-1. RefreshToken 일치 확인 */
    if (refreshToken !== token) {
      return res.json({ message: 'Unmatch refresh token' });
    }
  } else {
    /* 5. 유저 미존재 */
    return res.json({ message: 'No user' });
  }

  /* 6. 토큰 검증 */
  let result: string | JwtPayload = '';
  try {
    result = jwt.verify(token, jwtKey);
  } catch (e: any) {
    if (e.name === 'TokenExpiredError') {
      return res.json({ message: '재로그인 필요' });
    } else {
      return next(new Error(e.stack));
    }
  }

  /* 7. AccessToken 재발급 */
  let accessToken = '';
  try {
    accessToken = issueAccessToken(id, users[0].AUTH);
  } catch (e: any) {
    return next(new Error(e.stack));
  }

  /* 8. 유저 AccessToken DB 업데이트 */
  try {
    await handleSql(UPDATE_USER_ACCESS_TOKEN, { id });
  } catch (e: any) {
    return next(new Error(e.stack));
  }

  /* 9. 쿠키설정 */
  res.cookie('atk', accessToken, cookieConfig);
  req.headers.authorization = `Bearer ${accessToken}`;

  return next();
}

export {
  issueAccessToken,
  verifyAccessToken,
  issueRefreshToken,
  verifyRefreshToken
};
