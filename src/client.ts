import fs from 'fs'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import pinataSDK, { PinataClient } from '@pinata/sdk'

interface IpfsClient {
  /**
   * Upload string to IPFS.
   * 
   * @param filePath The file path to upload from.
   * @returns CID.
   */
  uploadFile: (filePath: string) => Promise<string>;

  /**
   * Upload JSON to IPFS.
   * 
   * @param json The JSON.
   * @param filePath The file path to upload at.
   * @returns CID.
   */
  uploadJson: (json: object) => Promise<string>
}

class SimpleIpfsClient implements IpfsClient {
  private _client: IPFSHTTPClient

  constructor(url: string) {
    this._client = create({ url, timeout: 10000 })
  }

  async uploadFile(filePath: string) {
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
    const { cid } = await this._client.add({ content })
    return `${cid}`
  }

  async uploadJson (json: object) {
    const { cid } = await this._client.add({ 
      content: Buffer.from(JSON.stringify(json, null, 2))
    })
    return `${cid}`
  }
}


class PinataIpfsClient implements IpfsClient {
  private _pinata: PinataClient

  constructor(apiKey: string, secret: string) {
    this._pinata = pinataSDK(apiKey, secret)
  }

  async uploadFile(filePath: string) {
    const str = fs.createReadStream(filePath, 'utf-8')
    const { IpfsHash } = await this._pinata.pinFileToIPFS(str)
    return IpfsHash
  }

  async uploadJson(json: object) {
    const { IpfsHash } = await this._pinata.pinJSONToIPFS(json)
    return IpfsHash
  }
}


const instances: Record <string, IpfsClient> = {}

/**
 * Get IPFS client instance.
 * @param url The IPFS API endpoint.
 * @returns {IpfsClient}
 */
export const getIpfsClient = (url: string): IpfsClient => {
  if (instances[url]) {
    return instances[url]
  }

  if (url.startsWith('pinata://')) {
    const [ apiKey, secret ] = url.substring(9).split(':')
    instances[url] = new PinataIpfsClient(apiKey, secret)
  } else {
    instances[url] = new SimpleIpfsClient(url)
  }

  return instances[url]
}
