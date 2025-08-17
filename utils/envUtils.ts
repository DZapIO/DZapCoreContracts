import { NODE_ENV_VAR_NAMES, ENVIRONMENT } from '../constants/others'

export const isProd = () => {
  return process.env.NODE_ENV == ENVIRONMENT.PRODUCTION
}

export const getEnvVar = (varName: NODE_ENV_VAR_NAMES) => {
  const envVar = process.env[NODE_ENV_VAR_NAMES[varName]]
  if (!envVar) throw Error(`Environment variable ${varName} is not defined`)
  return envVar
}

export const replaceEnvInStr = (url: string) =>
  url.replace(/<(\w+)>/g, (_, envVar) => getEnvVar(envVar))
