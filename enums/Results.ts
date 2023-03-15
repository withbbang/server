/**
 * 응답코드 모음
 *
 *
 * 응답 방법
 * 1. 데이터 없는 정상응답
 * -> res.json(Results[0]);
 *
 * 2. 데이터 있는 정상응답
 * -> res.json({ ...Results[0], ...data })
 *
 * 3. 에러 응답
 * -> res.json(Results[##])
 */
const Results = Object.freeze({
  0: { code: '000000', message: '성공' },
  10: { code: '000010', message: '오류발생' },
  20: { code: '000020', message: '비밀번호 불일치' },
  30: { code: '000030', message: '유저정보 부재' },
  40: { code: '000040', message: '인증정보 부재' },
  50: { code: '000050', message: '재인증정보 부재' },
  60: { code: '000060', message: '인증토큰 불일치' },
  70: { code: '000070', message: '재인증토큰 불일치' },
  80: { code: '000080', message: '인증토큰만료' },
  90: { code: '000090', message: '가입대기' }
});

export { Results };
