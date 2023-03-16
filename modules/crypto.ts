import crypto, { generateKeyPairSync } from 'crypto';

/**
 * 개인키, 공개키 key pair 생성 IIEF로 실행
 */
const { publicKey, privateKey }: crypto.KeyPairSyncResult<string, string> =
  (function (): crypto.KeyPairSyncResult<string, string> {
    return generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: process.env.passphrase
      }
    });
  })();

/**
 * RSA 복호화 함수
 * @param {string} encryptedMessage 암호화된 text
 * @param {string} privateKey 개인키
 * @returns {string} 복호화된 text
 */
function handleRSADecrypt(
  encryptedMessage: string,
  privateKey: string
): string {
  const rsaPrivateKey = {
    key: privateKey,
    passphrase: process.env.passphrase,
    padding: crypto.constants.RSA_PKCS1_PADDING
  };

  let decryptedMessage: Buffer = Buffer.from('');

  try {
    decryptedMessage = crypto.privateDecrypt(
      rsaPrivateKey,
      Buffer.from(encryptedMessage, 'base64')
    );
  } catch (e: any) {
    throw new Error(e.stack);
  }

  return decryptedMessage.toString('utf-8');
}

/**
 * 레인보우 테이블을 막기 위한 salt 생성 함수
 * @returns {string} salt 반환
 */
function handleCreateSalt(): string {
  let randomBytes: Buffer = Buffer.from('');

  try {
    randomBytes = crypto.randomBytes(16);
  } catch (e: any) {
    throw new Error(e.stack);
  }

  return randomBytes.toString('hex');
}

/**
 * 해쉬 생성 함수
 * @param {string} password 해쉬화 할 비밀번호
 * @param {string} salt 레인보우 테이블을 막을 salt
 * @returns {string} DB에 저장될 비밀번호 반환
 */
function handleCreateSha512(password: string, salt: string): string {
  let sha512: Buffer = Buffer.from('');

  try {
    sha512 = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  } catch (e: any) {
    throw new Error(e.stack);
  }

  return sha512.toString('hex');
}

export {
  publicKey,
  privateKey,
  handleRSADecrypt,
  handleCreateSalt,
  handleCreateSha512
};
