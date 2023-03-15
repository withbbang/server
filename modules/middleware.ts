import cookieParser from 'cookie-parser';
import express, {
  Express,
  Router,
  Request,
  Response,
  NextFunction
} from 'express';
import { Results } from '../enums/Results';

// body parser 및 cookie parser 세팅 함수
function handleSetParser(app: Express | Router): void {
  app.use(cookieParser(process.env.cookieKey)); // cookieParser(secretKey, optionObj)
  app.use(express.urlencoded({ extended: true })); // content-type이 application/x-www-form-urlencoded일 경우 파싱
  app.use(express.json()); // content-type이 application/json일 경우 파싱
}

// Request log 남기기
function handleRequestLogginMiddleware(app: Express | Router): void {
  app.use(function (req: Request, res: Response, next: NextFunction): void {
    console.log(`=======Request Info: ${req.method} ${req.url}=======`);

    next();
  });
}

// Response 전에 log 남기기
function handleResponseLogginMiddleware(app: Express | Router): void {
  app.use(function (req: Request, res: Response, next: NextFunction): void {
    res.on('finish', function (): void {
      console.log(
        `=======Response Info: ${req.method} ${req.url} ${res.statusCode}=======`
      );
    });

    next();
  });
}

// error middleware 설정
function handleErrorMiddleware(app: Express | Router): void {
  app.use(function (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): express.Response<any, Record<string, any>> | undefined {
    console.error(err);

    if (req.originalUrl.includes('/server')) {
      return res.json(Results[10]);
    } else {
      return;
    }
  });
}

export {
  handleSetParser,
  handleRequestLogginMiddleware,
  handleResponseLogginMiddleware,
  handleErrorMiddleware
};
