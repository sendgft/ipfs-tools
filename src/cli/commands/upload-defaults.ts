import fs from 'fs'
import path from 'path'
import got from 'got'
import { getIpfsClient } from '../..'
import { log, tryCatch } from '../utils'

export const getMeta = () => ({
  summary: 'Write sendGFT default metadata to IPFS and on-chain contract.',
  params: [
    {
      name: 'api',
      typeLabel: '{underline URL}',
      description: 'IPFS API endpoint URL.'
    },
    {
      name: 'gateway',
      typeLabel: '{underline URL}',
      description: 'IPFS gateway base URL.'
    },
  ]  
})

interface Params {
  api: string,
  gateway: string,
}

export const execute = async ({ api, gateway }: Params) => {
  const GFT_OPENED_SVG = fs.readFileSync(path.join(process.cwd(), 'data', 'gft-opened.svg'), 'utf-8')
  const GFT_UNOPENED_SVG = fs.readFileSync(path.join(process.cwd(), 'data', 'gft-unopened.svg'), 'utf-8')

  const ipfsClient = getIpfsClient(api)

  const openedGfImgCid: string = await tryCatch('Upload "opened GFT" image to IPFS', async () => {
    const { cid } = await ipfsClient.uploadString(GFT_OPENED_SVG)
    log(`Opened GFT image CID: ${cid}`)
    return cid
  })

  const unopenedGfImgCid: string = await tryCatch('Upload "unopened GFT" image to IPFS', async () => {
    const { cid } = await ipfsClient.uploadString(GFT_UNOPENED_SVG)
    log(`Unopened GFT image CID: ${cid}`)
    return cid
  })

  if (gateway.substring(-1) !== '/') {
    gateway = `${gateway}/`
  }
  
  const openedGfImgUrl = `${gateway}${openedGfImgCid}`
  const unopenedGfImgUrl = `${gateway}${unopenedGfImgCid}`
  
  // check gateway access
  await tryCatch('Check that "opened GFT" image is available on the gateway', async () => {
    const ret = await got(openedGfImgUrl)
    if (ret.body !== GFT_OPENED_SVG) {
      throw new Error(`Unable to verify "opened GFT" image via gateway: ${openedGfImgUrl}`)
    }
  })
  await tryCatch('Check that "unopened GFT" image is available on the gateway', async () => {
    const ret = await got(unopenedGfImgUrl)
    if (ret.body !== GFT_UNOPENED_SVG) {
      throw new Error(`Unable to verify "unopened GFT" image via gateway: ${unopenedGfImgUrl}`)
    }
  })
    
  // upload metadata
  const cid: string = await tryCatch('Upload metadata to IPFS', async () => {
    const { cid } = await ipfsClient.uploadJson({
      name: 'Unopened GFT',
      description: 'This is an unopened GFT sent via https://gft.xyz',
      image: openedGfImgUrl,
    })
    log(`Unopened GFT metadata CID: ${cid}`)
    return cid
  })

  log(`Default metadata CID: ${cid}`)
  log(`Opened GFT image URL: ${openedGfImgUrl}`)
}