import { config } from 'dotenv'
import findConfig from 'find-config'

config({ path: findConfig('.env') })

const dbConfig = {
  db: process.env.DB_DEV,
}
export default dbConfig
