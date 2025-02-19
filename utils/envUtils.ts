import { ENVIRONMENT } from '../types'

export const isProd = () => {
  return process.env.NODE_ENV == ENVIRONMENT.PRODUCTION
}
