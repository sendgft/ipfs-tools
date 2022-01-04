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
  const UNOPENED_GFT_SVG = fs.readFileSync(path.join(process.cwd(), 'data', 'unopened-gft.svg'), 'utf-8')

  const ipfsClient = getIpfsClient(api)

  const unopenedGfImgCid: string = await tryCatch('Upload default unopened image to IPFS', async () => {
    const { cid } = await ipfsClient.uploadString(UNOPENED_GFT_SVG)
    log(`Unopened GFT CID: ${cid}`)
    return cid
  })

  if (gateway.substring(-1) !== '/') {
    gateway = `${gateway}/`
  }
  
  const unopenedGfImgUrl = `${gateway}${unopenedGfImgCid}`
  
  // check gateway access
  await tryCatch('Check that unopened GFT image is available on the gateway', async () => {
    const ret = await got(unopenedGfImgUrl)
    if (ret.body !== UNOPENED_GFT_SVG) {
      throw new Error(`Unable to verify unopened GFT image via gateway: ${unopenedGfImgUrl}`)
    }
  })
    
  // upload metadata
  const cid: string = await tryCatch('Upload metadata to IPFS', async () => {
    const { cid } = await ipfsClient.uploadJson({
      name: 'Unopened GFT',
      description: 'This is an unopened GFT sent via https://gft.xyz',
      image: unopenedGfImgUrl,
    })
    log(`Default metadata CID: ${cid}`)
    return cid
  })
}