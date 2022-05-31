import path from 'path'
import glob from 'glob'
import fs from 'fs'
import got from 'got'
import { getIpfsClient } from '../..'
import { log, tryCatch } from '../../utils'

export const getMeta = () => ({
  summary: 'Upload a file or folder to IPFS.',
  params: [
    {
      name: 'path',
      typeLabel: '{underline path}',
      description: 'The path to the file or folder.',
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
  path: string,
  api: string,
  gateway: string,
}

interface UploadDefaultsResult {
  defaultMetadataCid: string,
  openedGftImgCid: string,
}

export const execute = async ({ path: fileOrFolder, api, gateway }: Params): Promise<void> => {
  const ipfsClient = getIpfsClient(api)

  const isFolder = fs.lstatSync(fileOrFolder).isDirectory()

  const ret = await tryCatch(`Upload "${fileOrFolder}" to IPFS`, async () => {
    let ret
    if (isFolder) {
      ret = await ipfsClient.uploadFolder(fileOrFolder)
    } else {
      ret = await ipfsClient.uploadFile(fileOrFolder)
    }
    log(`CID = ${ret.cid}`)
    log(`Path = ${ret.path}`)
    return ret
  })

  if (gateway.substring(-1) !== '/') {
    gateway = `${gateway}/`
  }

  const url = `${gateway}${ret.path}`

  // check gateway access
  await tryCatch(`Check that content is served from gateway: ${url}`, async () => {
    let ret, expected

    if (isFolder) {
      const f = glob.sync(path.join(fileOrFolder, '*'), { absolute: true })[0]
      const fn = path.basename(f)
      ret = await got(`${url}/${fn}`)
      expected = fs.readFileSync(f, { encoding: 'utf-8' }).toString()
    } else {
      ret = await got(url)
      expected = fs.readFileSync(fileOrFolder, { encoding: 'utf-8' }).toString()
    }
    if (ret.body !== expected) {
      throw new Error(`Unable to verify file image via gateway: ${url}`)
    }
  })

  log(`Gateway URL = ${url}`)  
}