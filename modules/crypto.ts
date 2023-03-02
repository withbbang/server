import crypto, { generateKeyPairSync } from 'crypto';

export function handleSetKeyPair(): crypto.KeyPairSyncResult<string, string> {
  return generateKeyPairSync('rsa', {
    modulusLength: 4096,
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
}

export function decryptMessage(encryptedMessage: string, privateKey: string) {
  const rsaPrivateKey = {
    key: privateKey,
    passphrase: process.env.passphrase,
    padding: crypto.constants.RSA_PKCS1_PADDING
  };

  const decryptedMessage = crypto.privateDecrypt(
    rsaPrivateKey,
    Buffer.from(encryptedMessage, 'base64')
  );

  return decryptedMessage.toString('utf8');
}
