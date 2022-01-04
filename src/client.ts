import { Readable } from 'stream'
import { Buffer } from 'buffer'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import pinataSDK, { PinataClient } from '@pinata/sdk'

abstract class IpfsClient {
  /**
   * Upload string to IPFS.
   * 
   * @param str The string.
   * @param filePath The file path to upload at.
   * @returns CID.
   */
  async uploadString (str: string): Promise<string> {
    throw new Error('not implemented')
  }

  /**
   * Upload JSON to IPFS.
   * 
   * @param json The JSON.
   * @param filePath The file path to upload at.
   * @returns CID.
   */
  async uploadJson (json: object) {
    return this.uploadString(JSON.stringify(json, null, 2))
  }
}

class SimpleIpfsClient extends IpfsClient {
  private _client: IPFSHTTPClient

  constructor(url: string) {
    super()
    this._client = create({ url, timeout: 10000 })
  }

  async uploadString(str: string) {
    const { cid } = await this._client.add({
      content: Buffer.from(str)
    })

    return `${cid}`
  }
}


class PinatapfsClient extends IpfsClient {
  private _pinata: PinataClient

  constructor(apiKey: string, secret: string) {
    super()
    this._pinata = pinataSDK(apiKey, secret)
  }

  async uploadString(str: string) {
    const strStream = Readable.from(str)
    const { IpfsHash } = await this._pinata.pinFileToIPFS(strStream)
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
    instances[url] = new PinatapfsClient(apiKey, secret)
  } else {
    instances[url] = new SimpleIpfsClient(url)
  }

  return instances[url]
}
