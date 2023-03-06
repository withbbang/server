import crypto, { generateKeyPairSync } from 'crypto';

// 개인키, 공개키 key pair 생성
const { publicKey, privateKey }: crypto.KeyPairSyncResult<string, string> =
  (function () {
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

// RSA 복호화
function handleRSADecrypt(
  encryptedMessage: string,
  privateKey: string
): string {
  const rsaPrivateKey = {
    key: privateKey,
    passphrase: process.env.passphrase,
    padding: crypto.constants.RSA_PKCS1_PADDING
  };

  const decryptedMessage = crypto.privateDecrypt(
    rsaPrivateKey,
    Buffer.from(encryptedMessage, 'base64')
  );

  return decryptedMessage.toString('utf-8');
}

// 레인보우 테이블을 막기 위한 salt 생성
function handleCreateSalt(): string {
  let randomBytes = Buffer.from('');

  try {
    randomBytes = crypto.randomBytes(16);
  } catch (e) {
    console.error('Error creating salt: ', e);
    throw Error();
  }

  return randomBytes.toString('hex');
}

// 해쉬 함수
function handleCreateSha512(password: string, salt: string): string {
  let sha512 = Buffer.from('');

  try {
    sha512 = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  } catch (e) {
    console.error('Error creating sha512: ', e);
    throw Error();
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
