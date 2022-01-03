var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';
export class IpfsClient {
    /**
     * Constructor.
     *
     * @param url The IFPS API endpoint.
     */
    constructor(url) {
        this._client = create({ url, timeout: 10000 });
    }
    /**
     * Upload string to IPFS.
     *
     * @param str The string.
     * @param filePath The file path to upload at.
     * @returns CID.
     */
    uploadString(str, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._client.add({
                path: filePath,
                content: Buffer.from(str)
            });
        });
    }
    /**
     * Upload JSON to IPFS.
     *
     * @param json The JSON.
     * @param filePath The file path to upload at.
     * @returns CID.
     */
    uploadJson(json, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.uploadString(JSON.stringify(json, null, 2), filePath);
        });
    }
}
IpfsClient.instances = {};
/**
 * Get IPFS client instance.
 * @param url The IPFS API endpoint.
 * @returns {IpfsClient}
 */
export const getIpfsClient = (url) => {
    if (!IpfsClient.instances[url]) {
        IpfsClient.instances[url] = new IpfsClient(url);
    }
    return IpfsClient.instances[url];
};
