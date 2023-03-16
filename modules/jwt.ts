// 라이브러리 임포트
import jwt from 'jsonwebtoken';

/* Token 생성 및 검증용 key */
const jwtKey = process.env.jwtKey as string;

/**
 * AccessToken 생성 함수
 * @param {string} id 관리자 아이디
 * @param {number} auth 관리자 권한
 * @returns {string} Access Token 반환
 */
function handleIssueAccessToken(id: string, auth: number): string {
  const payload = { id, auth };

  /* AccessToken 생성 */
  let accessToken = '';
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

/**
 * RefreshToken 생성 함수
 * @returns {string} Refresh Token 반환
 */
function handleIssueRefreshToken(): string {
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

/**
 * Token 검증 함수
 * @param token 토큰
 * @returns {jwt.JwtPayload} 해석된 값 반환
 */
function handleVerifyToken(token: string): jwt.JwtPayload {
  try {
    return jwt.verify(token, jwtKey) as jwt.JwtPayload;
  } catch (e: any) {
    throw new Error(e.stack);
  }
}

export { handleIssueAccessToken, handleIssueRefreshToken, handleVerifyToken };
