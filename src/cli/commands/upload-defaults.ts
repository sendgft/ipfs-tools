import fs from 'fs'
import path from 'path'
import got from 'got'
import { getIpfsClient } from '../..'
import { log, tryCatch } from '../../utils'

export const getMeta = () => ({
  summary: 'Write sendGFT default metadata to IPFS and on-chain contract.',
  params: [
    {
      name: 'folder',
      typeLabel: '{underline path}',
      description: 'The path to the data folder.',
      defaultValue: path.join(process.cwd(), 'data'),
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
  folder: string,
  api: string,
  gateway: string,
}

export const execute = async ({ folder, api, gateway }: Params) => {
  const GFT_OPENED_SVG = path.join(folder, 'gft-opened.svg')
  const GFT_UNOPENED_SVG = path.join(folder, 'gft-unopened.svg')

  const ipfsClient = getIpfsClient(api)

  const openedGfImgCid: string = await tryCatch('Upload "opened GFT" image to IPFS', async () => {
    const cid = await ipfsClient.uploadFile(GFT_OPENED_SVG)
    log(`Opened GFT image CID: ${cid}`)
    return cid
  })

  const unopenedGfImgCid: string = await tryCatch('Upload "unopened GFT" image to IPFS', async () => {
    const cid = await ipfsClient.uploadFile(GFT_UNOPENED_SVG)
    log(`Unopened GFT image CID: ${cid}`)
    return cid
  })

  if (gateway.substring(-1) !== '/') {
    gateway = `${gateway}/`
  }
  
  const openedGfImgUrl = `${gateway}${openedGfImgCid}`
  const unopenedGfImgUrl = `${gateway}${unopenedGfImgCid}`
  
  // check gateway access
  await tryCatch(`Check that "opened GFT" image exists: ${openedGfImgUrl}`, async () => {
    const ret = await got(openedGfImgUrl)
    const expected = fs.readFileSync(GFT_OPENED_SVG, { encoding: 'utf-8' }).toString()
    if (ret.body !== expected) {
      throw new Error(`Unable to verify "opened GFT" image via gateway: ${openedGfImgUrl}`)
    }
  })
  await tryCatch(`Check that "unopened GFT" image exists: ${unopenedGfImgUrl}`, async () => {
    const ret = await got(unopenedGfImgUrl)
    const expected = fs.readFileSync(GFT_UNOPENED_SVG, { encoding: 'utf-8' }).toString()
    if (ret.body !== expected) {
      throw new Error(`Unable to verify "unopened GFT" image via gateway: ${unopenedGfImgUrl}`)
    }
  })
    
  // upload metadata
  const cid: string = await tryCatch('Upload metadata to IPFS', async () => {
    const cid = await ipfsClient.uploadJson({
      name: 'Unopened GFT',
      description: 'This is an unopened GFT sent via https://gft.xyz',
      image: unopenedGfImgUrl,
    })
    log(`Unopened GFT metadata CID: ${cid}`)
    return cid
  })

  log(`Default metadata CID: ${cid}`)
  log(`Opened GFT image CID: ${openedGfImgCid}`)
}