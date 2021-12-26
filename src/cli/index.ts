/* eslint-disable import/no-dynamic-require */

import glob from 'glob'
import path from 'path'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'

import { exit, logError } from './utils'

// load commands
const COMMANDS = glob.sync(path.join(__dirname, 'commands', '*.js')).reduce((m, file) => {
  m[path.basename(file, '.js')] = require(file)
  return m
}, {} as Record<string, any>)

const renderParams = (params: any) => {
  return (params || []).reduce((m: string[], { name, typeLabel }: any) => {
    m.push(`--${name} ${typeLabel || ''}`)
    return m
  }, []).join(' ')
}

// show usage guide
function helpCommand (comm: string) {
  if (comm) {
    if (!COMMANDS[comm]) {
      logError(`Unrecognized command: ${comm}`)
    } else {
      const { summary, params, options } = COMMANDS[comm].getMeta()

      const sections = [
        {
          header: `ipfs-sendgft: ${comm}`,
          content: summary,
        },
        {
          header: 'Usage',
          content: `ipfs-sendgft ${comm} ${renderParams(params)} ${options ? '[options]' : ''}`
        },
        ...(params ? [ {
          header: 'Parameters',
          optionList: params,
        } ] : []),
        ...(options ? [ {
          header: 'Options',
          optionList: options,
        } ] : []),
      ]

      console.log(commandLineUsage(sections))

      exit()
    }
  }

  const sections = [
    {
      header: 'ipfs-sendgft',
      content: ''
    },
    {
      header: 'Usage',
      content: '$ ipfs-sendgft <command> [options]'
    },
    {
      header: 'Commands',
      content: Object.entries(COMMANDS).map(([ name, { getMeta } ]) => ({
        name,
        summary: getMeta().summary,
      })).concat({
        name: 'help',
        summary: 'Print this usage guide. Use "help <command>" for help on a specific command.'
      }),
    }
  ]

  console.log(commandLineUsage(sections))

  exit()
}

async function main () {
  const { command, _unknown: argv = [] } = commandLineArgs([
    { name: 'command', defaultOption: true }
  ], {
    stopAtFirstUnknown: true
  })

  if ('help' === command) {
    const { commandForHelp } = commandLineArgs([
      { name: 'commandForHelp', defaultOption: true }
    ], { argv })

    helpCommand(commandForHelp)
  }

  if (!COMMANDS[command]) {
    helpCommand(command)
  }

  // command is valid so let's continue
  const { params = [], options = [] } = COMMANDS[command].getMeta()

  let args: any

  try {
    const defs = params.concat(options)

    args = defs.length
      ? commandLineArgs(defs, { argv, stopAtFirstUnknown: true })
      : {}

    // invalid args?
    if (args._unknown) {
      throw new Error(`Invalid argument: ${args._unknown}`)
    }

    // check that all param values are provided
    params.forEach(({ name }: any) => {
      if (undefined === args[name]) {
        throw new Error(`Missing parameter: ${name}`)
      }
    })
  } catch (err) {
    logError((err as Error).message)
    helpCommand(command)
  }

  // execute
  await COMMANDS[command].execute(args)
}

main().catch(err => {
  logError(err.message)

  if (err.details) {
    logError(Array.isArray(err.details) ? err.details.join('\n') : err.details)
  }
}).finally(() => exit())
