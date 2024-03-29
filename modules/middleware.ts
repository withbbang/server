// 라이브러리 임포트
import cookieParser from 'cookie-parser';
import express, {
  Express,
  Router,
  Request,
  Response,
  NextFunction
} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import util from 'util';

// 모듈 임포트
import { cookieConfig } from '../config/config';
import { UPDATE_USER_ACCESS_TOKEN, SELECT_USER } from '../queries/common';
import { User } from '../types/User';
import { handleSql } from './oracleSetting';
import { Results } from '../enums/Results';
import { handleIssueAccessToken } from './jwt';
import { handleCheckRequired } from './common';
import { logger } from '../config/winston';

/* Token 생성 및 검증용 key */
const jwtKey = process.env.jwtKey as string;

/**
 * body parser 및 cookie parser 세팅 Middleware
 * @param {Express | Router} app 라우터
 */
function handleSetParser(app: Express | Router): void {
  app.use(cookieParser(process.env.cookieKey)); // cookieParser(secretKey, optionObj)
  app.use(express.urlencoded({ extended: true })); // content-type이 application/x-www-form-urlencoded일 경우 파싱
  app.use(express.json()); // content-type이 application/json일 경우 파싱
}

/**
 * Request log 남기기 Middleware
 * @param {Express | Router} app 라우터
 */
function handleRequestLoggingMiddleware(app: Express | Router): void {
  app.use(function (req: Request, res: Response, next: NextFunction): void {
    // logger.debug(
    //   `===============================================================================================Request Info: ${req.method} ${req.url}===============================================================================================`
    // );
    console.log(`=======Request Info: ${req.method} ${req.url}=======`);

    next();
  });
}

/**
 * Response 전에 log 남기기 Middleware
 * @param {Express | Router} app 라우터
 */
function handleResponseLoggingMiddleware(app: Express | Router): void {
  app.use(function (req: Request, res: Response, next: NextFunction): void {
    const oldJson = res.json;

    res.json = (body) => {
      res.locals.body = body;
      // logger.debug(`===============================================================================================Response Info: ${req.method} ${req.url} ${body}===============================================================================================`)
      console.log(
        `=======Response Info: ${res.statusCode} ${util.inspect(
          body,
          false,
          null,
          true
        )}=======`
      );
      return oldJson.call(res, body);
    };

    next();
  });
}

/**
 * Error 처리 Middleware
 * @param {Express | Router} app 라우터
 */
function handleErrorMiddleware(app: Express | Router): void {
  app.use(function (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): express.Response<any, Record<string, any>> | undefined {
    // logger.error(err);
    console.error(err);

    if (req.originalUrl.includes('/server')) {
      return res.json(Results[10]);
    } else {
      return;
    }
  });
}

/**
 * User 검증 Middleware
 * @param {Request} req Http Request
 * @param {Response} res Http Response
 * @param {NextFunction} next 다음 미들웨어로 넘기는 함수
 * @returns {Promise<any>}
 */
async function handleVerifyUserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  /* 0. 필수값 존재 확인 */
  const { id } = req.body;
  if (handleCheckRequired({ id })) {
    return res.json(Results[130]);
  }

  /* 1. 요청 헤더에 토큰 존재 여부 확인 */
  let token: string = '';
  if (req.headers.authorization) {
    token = req.headers.authorization.split('Bearer ')[1];
  } else {
    return res.json(Results[40]);
  }

  /* 2. 요청 헤더에 리프레시 토큰 존재 여부 확인 */
  let refresh = req.headers.refresh as string | undefined;
  if (refresh) {
    refresh = refresh.split('Bearer ')[1];
  } else {
    return res.json(Results[50]);
  }

  /* 3. 회원 존재 여부 확인 */
  let users: null | Array<User> = null;
  try {
    users = await handleSql(SELECT_USER({ id }));
  } catch (e: any) {
    return next(new Error(e.stack));
  }

  let accessToken: string | undefined = '';
  let refreshToken: string | undefined = '';
  if (Array.isArray(users) && users.length > 0) {
    /* 4. 유저 존재 */
    accessToken = users[0].ACCESS_TOKEN;
    refreshToken = users[0].REFRESH_TOKEN;
    req.body.tempAuth = users[0].AUTH;

    /* 4-1. AccessToken 일치 확인 */
    if (accessToken !== token || refreshToken !== refresh) {
      return res.json(Results[60]);
    }
  } else {
    /* 5. 유저 미존재 */
    return res.json(Results[30]);
  }

  return next();
}

/**
 * AccessToken 검증 Middleware
 * @param {Request} req Http Request
 * @param {Response} res Http Response
 * @param {NextFunction} next 다음 미들웨어로 넘기는 함수
 * @returns {Promise<any>}
 */
async function handleVerifyATKMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  /* 1. 요청 헤더에 토큰 존재 여부 확인 */
  let token: string = '';
  if (req.headers.authorization) {
    token = req.headers.authorization.split('Bearer ')[1];
  } else {
    return res.json(Results[40]);
  }

  /* 2. 토큰에서 유저 ID 빼오기 */
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, jwtKey) as jwt.JwtPayload;
  } catch (e: any) {
    if (e.name === 'TokenExpiredError') {
      /* 2-1. 토큰 만료시 재발급 */
      req.body.requiredRefresh = 'Y';
    } else if (e.name === 'JsonWebTokenError') {
      return res.json(Results[90]);
    } else {
      /* 2-2. 다른 에러일 경우 넘기기 */
      return next(new Error(e.stack));
    }
  }

  return next();
}

/**
 * RefreshToken 검증 Middleware
 * @param {Request} req Http Request
 * @param {Response} res Http Response
 * @param {NextFunction} next 다음 미들웨어로 넘기는 함수
 * @returns {Promise<any>}
 */
async function handleVerifyRTKMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  /* 1. access token 만료일 경우에만 로직 태우기 */
  if (req.body.requiredRefresh !== 'Y') {
    return next();
  }

  /* 2. 요청 헤더에 토큰 존재 여부 확인 */
  let refresh = req.headers.refresh as string | undefined;
  if (refresh) {
    refresh = refresh.split('Bearer ')[1];
  } else {
    return res.json(Results[50]);
  }

  /* 7. 토큰 검증 */
  try {
    jwt.verify(refresh, jwtKey);
  } catch (e: any) {
    if (e.name === 'TokenExpiredError') {
      return res.json(Results[80]);
    } else {
      return next(new Error(e.stack));
    }
  }

  /* 8. AccessToken 재발급 */
  let accessToken = '';
  try {
    accessToken = handleIssueAccessToken(req.body.id, req.body.tempAuth);
  } catch (e: any) {
    return next(new Error(e.stack));
  }

  /* 9. 유저 AccessToken DB 업데이트 */
  try {
    await handleSql(UPDATE_USER_ACCESS_TOKEN({ accessToken, id: req.body.id }));
  } catch (e: any) {
    return next(new Error(e.stack));
  }

  /* 10. 쿠키 설정 */
  res.cookie('atk', accessToken, cookieConfig);

  return next();
}

export {
  handleSetParser,
  handleRequestLoggingMiddleware,
  handleResponseLoggingMiddleware,
  handleErrorMiddleware,
  handleVerifyUserMiddleware,
  handleVerifyATKMiddleware,
  handleVerifyRTKMiddleware
};
