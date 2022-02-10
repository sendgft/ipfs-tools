import fs from 'fs'
import { create } from 'ipfs-http-client'
import pinataSDK, { PinataClient } from '@pinata/sdk'
import got from 'got'

export interface IpfsUploadOptions {
  /**
   * Gateway URL (with trailing slash) through which to verify the upload.
   */
  verifyViaGateway?: string
}

abstract class IpfsClient {
  /**
   * Upload file to IPFS.
   * 
   * @param filePath The file path to upload from.
   * @param options upload options.
   * @returns CID.
   */
  async uploadFile (filePath: string, options?: IpfsUploadOptions): Promise<string> {
    const cid = await this._uploadFile(filePath)
    await this._postProcessUpload(cid, options)
    return cid
  }

  /**
   * Upload JSON to IPFS.
   * 
   * @param json The JSON.
   * @param options upload options.
   * @returns CID.
   */
  async uploadJson (json: object, options?: IpfsUploadOptions): Promise<string> {
    const cid = await this._uploadJson(json)
    await this._postProcessUpload(cid, options)
    return cid
  }

  /**
   * Upload file to IPFS.
   * 
   * @param filePath The file path to upload from.
   * @returns CID.
   */
  protected abstract _uploadFile(filePath: string): Promise<string>

  /**
   * Upload JSON to IPFS.
   * 
   * @param json The JSON.
   * @returns CID.
   */
  protected abstract _uploadJson(json: object): Promise<string>

  /**
   * Post-process an upload.
   * 
   * @param cid The CID.
   * @param options upload options.
   */
  protected async _postProcessUpload (cid: string, options?: IpfsUploadOptions) {
    if (options?.verifyViaGateway) {
      const url = `${options.verifyViaGateway}${cid}`
      try {
        await got(url) // this will throw if there is an error
      } catch (err) {
        throw new Error(`Unable to verify existence of CID via gateway: ${url}`)
      }
    }
  }
}

class SimpleIpfsClient extends IpfsClient {
  private _client: any

  constructor(url: string) {
    super()
    this._client = create({ url, timeout: 10000 })
  }

  async _uploadFile(filePath: string) {
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
    const { cid } = await this._client.add({ content })
    return `${cid}`
  }

  async _uploadJson(json: object) {
    const { cid } = await this._client.add({ 
      content: Buffer.from(JSON.stringify(json, null, 2))
    })
    return `${cid}`
  }
}


class PinataIpfsClient extends IpfsClient {
  private _pinata: PinataClient

  constructor(apiKey: string, secret: string) {
    super()
    this._pinata = pinataSDK(apiKey, secret)
  }

  async _uploadFile(filePath: string) {
    const str = fs.createReadStream(filePath, 'utf-8')
    const { IpfsHash } = await this._pinata.pinFileToIPFS(str)
    return IpfsHash
  }

  async _uploadJson(json: object) {
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