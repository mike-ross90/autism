import { config } from 'dotenv'
config()

const serverConfig = {
  SERVER_PORT: process.env.SERVER_PORT || 8000,
}

export default serverConfig
