import { Buffer } from 'buffer'
import { create, IPFSHTTPClient } from 'ipfs-http-client'

export class IpfsClient {
  public static instances: Record<string, IpfsClient> = {}
  private _client: IPFSHTTPClient

  constructor (url: string) {
    this._client = create({ url, timeout: 10000 })
  }

  async uploadString (str: string, filePath?: string) {
    return this._client.add({
      path: filePath,
      content: Buffer.from(str)
    })
  }

  async uploadJson(json: object, filePath?: string) {
    return this.uploadString(JSON.stringify(json, null, 2), filePath)
  }
}

export const getIpfsClient = (url: string): IpfsClient => {
  if (!IpfsClient.instances[url]) {
    IpfsClient.instances[url] = new IpfsClient(url)
  }
  return IpfsClient.instances[url]
}
