import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { SELECT_USER } from '../queries/select';
import { USER } from '../types/USER';
import { handleCatchClause } from './common';
import { handleSql } from './oracleSetting';

/* Token 생성 및 검증 key*/
const jwtKey = 'breadkimismacho';

/* AccessToken 생성 */
function issueAccessToken(params: any): any {
  const payload = {
    id: params.id,
    auth: params.auth
  };

  let accessToken = '';

  /* AccessToken 생성 */
  try {
    accessToken = jwt.sign(payload, jwtKey, {
      expiresIn: '2h',
      algorithm: 'HS512'
    });
  } catch (e: any) {
    handleCatchClause('Y', e, 'Creating access token');
  }

  return accessToken;
}

/* AccessToken 검증 */
async function verifyAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  /* 1. 회원 존재 여부 확인 */
  let user: null | USER = null;
  let accessToken: string | undefined = '';
  try {
    user = await handleSql(SELECT_USER, { id: req.body.id });
    accessToken = user?.ACCESS_TOKEN;
  } catch (e: any) {
    handleCatchClause('N', e, e.message, next);
  }

  /* 2. 요청 헤더에 토큰 존재 여부 확인 */
  let result: string | JwtPayload = '';
  let token: string = '';
  if (req.headers.authorization) {
    try {
      token = req.headers.authorization.split('Bearer ')[1];
      result = jwt.verify(token, jwtKey);
    } catch (e: any) {
      handleCatchClause('N', e, 'Verifying access token', next);
    }
  } else {
    handleCatchClause(
      'N',
      new Error('Empty access token'),
      'Empty access token',
      next
    );
  }

  /* 3. AccessToken 일치 확인 */
  if (accessToken !== token) {
    handleCatchClause(
      'N',
      new Error('Unmatch access token'),
      'Unmatch access token',
      next
    );
  }

  next();
}

/* RefreshToken 생성 */
function issueRefreshToken(params: any): any {
  let refreshToken = '';

  try {
    refreshToken = jwt.sign({}, jwtKey, {
      expiresIn: '14d',
      algorithm: 'HS512'
    });
  } catch (e: any) {
    handleCatchClause('Y', e, 'Creating refresh token');
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
  let user: null | USER = null;
  let accessToken: string | undefined = '';
  let refreshToken: string | undefined = '';
  try {
    user = await handleSql(SELECT_USER, { id: req.body.id });
    accessToken = user?.ACCESS_TOKEN;
    refreshToken = user?.REFRESH_TOKEN;
  } catch (e: any) {
    handleCatchClause('N', e, e.message, next);
  }

  /* 2. 요청 헤더에 토큰 존재 여부 확인 */
}
