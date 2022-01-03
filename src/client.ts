import { Buffer } from 'buffer'
import { create, IPFSHTTPClient } from 'ipfs-http-client'

export class IpfsClient {
  public static instances: Record<string, IpfsClient> = {}
  private _client: IPFSHTTPClient

  /**
   * Constructor.
   * 
   * @param url The IFPS API endpoint.
   */
  constructor(url: string) {
    this._client = create({ url, timeout: 10000 })
  }

  /**
   * Upload string to IPFS.
   * 
   * @param str The string.
   * @param filePath The file path to upload at.
   * @returns CID.
   */
  async uploadString(str: string, filePath?: string) {
    return this._client.add({
      path: filePath,
      content: Buffer.from(str)
    })
  }

  /**
   * Upload JSON to IPFS.
   * 
   * @param json The JSON.
   * @param filePath The file path to upload at.
   * @returns CID.
   */
  async uploadJson(json: object, filePath?: string) {
    return this.uploadString(JSON.stringify(json, null, 2), filePath)
  }
}


/**
 * Get IPFS client instance.
 * @param url The IPFS API endpoint.
 * @returns {IpfsClient}
 */
export const getIpfsClient = (url: string): IpfsClient => {
  if (!IpfsClient.instances[url]) {
    IpfsClient.instances[url] = new IpfsClient(url)
  }
  return IpfsClient.instances[url]
}
