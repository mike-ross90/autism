import bcrypt from 'bcrypt'
import { config } from 'dotenv'
import { appendFileSync } from 'fs'

config()
const salt = process.env.SALT

let genSalt = salt
if (!salt) {
  genSalt = bcrypt.genSaltSync(12)
  appendFileSync('./.env', '\nSALT= ' + genSalt)
}
export { genSalt }
