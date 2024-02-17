// Crypto generator for public key and private key for the jwt token
import * as Jose from 'jose'
import fs from 'fs'
const jose = Jose

export const KeyGenerator = async () => {
  try {
    const privateKey = await jose.importPKCS8(
      fs
        .readFileSync(
          'C:\\Users\\shayan.ahmed\\Desktop\\backend\\autistic-backend\\autistic-backend\\privateKey.pem',
          // 'C:/Users/muhammad.wasi/Desktop/Autism-Care/privateKey.pem',
        )
        .toString(),
      'pem',
    )
    console.log('privateKey', privateKey)
    const publicKey = await jose.importSPKI(
      fs
        .readFileSync(
          'C:\\Users\\shayan.ahmed\\Desktop\\backend\\autistic-backend\\autistic-backend\\publicKey.pem',
          // 'C:/Users/muhammad.wasi/Desktop/Autism-Care/publicKey.pem',
        )
        .toString(),
      'pem',
    )
    console.log('publicKey: ', publicKey)
    if (privateKey && publicKey) {
      return { privateKey, publicKey }
    }
  } catch (error) {
    console.error('Error in generating keys: ', error)
    return { error }
  }
  const secret = await jose.generateKeyPair('PS256', {
    extractable: true,
    modulusLength: 2048,
    crv: 'P-256',
  })
  console.log('secret: ', secret)
  fs.writeFileSync(
    'C:\\Users\\shayan.ahmed\\Desktop\\backend\\autistic-backend\\autistic-backend\\privateKey.pem',
    // 'C:/Users/muhammad.wasi/Desktop/Autism-Care/privateKey.pem',
    await jose.exportPKCS8(secret.privateKey),
  )
  fs.writeFileSync(
    'C:\\Users\\shayan.ahmed\\Desktop\\backend\\autistic-backend\\autistic-backend\\publicKey.pem',
    // 'C:/Users/muhammad.wasi/Desktop/Autism-Care/publicKey.pem',
    await jose.exportSPKI(secret.publicKey),
  )
  return secret
}

const keyGen = await KeyGenerator()
export default keyGen
