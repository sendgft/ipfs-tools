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
  ]  
})

interface Params {
  api: string,
}

const DEFAULT_METADATA = {
  name: 'Unopened GFT',
  description: 'This is an unopened GFT sent via https://gft.xyz',
  image: 'https://www.kornferry.com/content/dam/kornferry/insights-images/articles/BurnisonDec13.20Home.jpg',
}

export const execute = async ({ api }: Params) => {
  const ipfsClient = getIpfsClient(api)

  const cid: string = await tryCatch('Upload metadata to IPFS', async () => {
    const { cid } = await ipfsClient.uploadJson(DEFAULT_METADATA)
    log(`CID: ${cid}`)
    return cid
  })
}