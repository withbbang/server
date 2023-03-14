const cookieConfigSecure = {
  httpOnly: true,
  signed: true,
  secure: true
};

// httpOnly 설정은 브라우져에서 쿠키 접근을 제한시킨다.
const cookieConfig = {
  // httpOnly: true,
  secure: true
};

export { cookieConfig, cookieConfigSecure };
