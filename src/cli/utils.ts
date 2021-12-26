import chalk from 'chalk'

let hasError = false

export const exit = () => {
  process.exit(hasError ? -1 : 0)
}

export const logError = (msg: string) => {
  hasError = true
  console.error(chalk.red(msg))
}