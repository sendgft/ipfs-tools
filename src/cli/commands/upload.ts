import fs from 'fs'
import got from 'got'
import { getIpfsClient } from '../..'
import { log, tryCatch } from '../../utils'

export const getMeta = () => ({
  summary: 'Upload a file to IPFS.',
  params: [
    {
      name: 'file',
      typeLabel: '{underline path}',
      description: 'The path to the file.',
    },
  ],
  options: [
    {
      name: 'api',
      description: 'IPFS API endpoint URL.',
      defaultValue: 'http://127.0.0.1:5001/api/v0',
    },
    {
      name: 'gateway',
      description: 'IPFS gateway base URL.',
      defaultValue: 'http://127.0.0.1:5002/ipfs',
    },
  ]
})

interface Params {
  file: string,
  api: string,
  gateway: string,
}

interface UploadDefaultsResult {
  defaultMetadataCid: string,
  openedGftImgCid: string,
}

export const execute = async ({ file, api, gateway }: Params): Promise<void> => {
  const ipfsClient = getIpfsClient(api)

  const ret = await tryCatch(`Upload "${file}" to IPFS`, async () => {
    const ret = await ipfsClient.uploadFile(file)
    log(`CID = ${ret.cid}`)
    log(`Path = ${ret.path}`)
    return ret
  })

  if (gateway.substring(-1) !== '/') {
    gateway = `${gateway}/`
  }

  const url = `${gateway}${ret.path}`

  // check gateway access
  await tryCatch(`Check that file can be served from gateway: ${url}`, async () => {
    const ret = await got(url)
    const expected = fs.readFileSync(file, { encoding: 'utf-8' }).toString()
    if (ret.body !== expected) {
      throw new Error(`Unable to verify file image via gateway: ${url}`)
    }
  })

  log(`Gateway URL = ${url}`)  
}