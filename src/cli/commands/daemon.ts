import execa from 'execa'
import path from 'path'

const PATH_TO_CONFIG_FILE = path.join(__dirname, '..', '..', '..', '..', 'data', 'ipfs-local-config.json')

export const getMeta = () => ({
  summary: 'Run local IPFS daemon.',
})

export const execute = async () => {
  await execa('ipfs', ['config', 'replace', PATH_TO_CONFIG_FILE])
  const proc = execa('ipfs', ['daemon'])
  proc.stdout?.pipe(process.stdout)
  await proc
}