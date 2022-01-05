import chalk from 'chalk'

let hasError = false

export const exit = () => {
  process.exit(hasError ? -1 : 0)
}

export const log = (msg: string) => {
  console.log(chalk.white(msg))
}

export const logError = (msg: string) => {
  hasError = true
  console.error(chalk.red(msg))
}

export const tryCatch = async (title: string, fn: Function): Promise<any> => {
  console.log(chalk.cyan(`${title} >`))
  const ret = await fn()
  console.log(chalk.cyan(`< ${title}`))
  return ret
}

export const constructGatewayUrl = (gatewayBaseUrl: string, cid: string): string => {
  if (gatewayBaseUrl.charAt(gatewayBaseUrl.length - 1) !== '/') {
    gatewayBaseUrl += '/'
  }
  return `${gatewayBaseUrl}${cid}`
}

