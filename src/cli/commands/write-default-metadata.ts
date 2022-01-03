import { Contract } from '@ethersproject/contracts'
import got from 'got'
import { Wallet } from '@ethersproject/wallet'
import { JsonRpcProvider, Provider } from '@ethersproject/providers'
import { contracts } from '@sendgft/contracts'

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
    {
      name: 'rpc',
      typeLabel: '{underline URL}',
      description: 'EVM chain RPC endpoint URL.'
    },
    {
      name: 'mnemonic',
      typeLabel: '{underline mnemonic}',
      description: 'Ethereum wallet mnemonic.'
    },
    {
      name: 'contract',
      typeLabel: '{underline address}',
      description: 'On-chain Gifter smart contract address.'
    },
  ]  
})

interface Params {
  api: string,
  gateway: string,
  rpc: string,
  contract: string,
  mnemonic: string,
}

const DEFAULT_METADATA = {
  name: 'Unopened GFT',
  description: 'This is an unopened GFT sent via https://gft.xyz',
  image: 'https://www.kornferry.com/content/dam/kornferry/insights-images/articles/BurnisonDec13.20Home.jpg',
}

export const execute = async ({
  api, gateway, rpc, contract: address, mnemonic,
}: Params) => {
  const ipfsClient = getIpfsClient(api)

  const cid: string = await tryCatch('Upload metadata to IPFS', async () => {
    const { cid } = await ipfsClient.uploadJson(DEFAULT_METADATA)
    log(`CID: ${cid}`)
    return cid
  })

  await tryCatch('Test IPFS gateway access', async () => {
    const response = await got(`${gateway}/${cid}`)
    log(response.body)
    if (JSON.parse(response.body).name !== DEFAULT_METADATA.name) {
      throw new Error('JSON mismatch!')
    }
  })

  const provider: Provider = await tryCatch('Connect to blockchain', async () => {
    const provider = new JsonRpcProvider(rpc)
    const info = await provider.getNetwork()
    log(`Network ${info.name} (${info.chainId})`)
    return provider
  })

  const wallet: Wallet = await tryCatch('Load wallet', async () => {
    let wallet = Wallet.fromMnemonic(mnemonic)
    wallet = await wallet.connect(provider)
    const bal = await wallet.getBalance()
    log(`Wallet: ${wallet.address} (bal: ${bal})`)
    return wallet
  })

  const contract: Contract = await tryCatch('Check access to on-chain contract', async () => {
    const { abi } = contracts.GifterImplementationV1
    const contract = new Contract(address, abi, wallet)
    const admin = await contract.getAdmin()
    log(`Contract admin: ${admin}`)
    if (admin.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error(`Wallet is not the admin!`)
    }
    return contract
  })

  await tryCatch('Contract: set default content hash', async () => {
    (await await contract.setDefaultContentHash(cid)).wait()
  })

  await tryCatch('Contract: set token base URI', async () => {
    await (await contract.setBaseURI(gateway)).wait()
  })
}