var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
import { create } from 'ipfs-http-client';
import pinataSDK from '@pinata/sdk';
class SimpleIpfsClient {
    constructor(url) {
        this._client = create({ url, timeout: 10000 });
    }
    uploadFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
            const { cid } = yield this._client.add({ content });
            return `${cid}`;
        });
    }
    uploadJson(json) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cid } = yield this._client.add({
                content: Buffer.from(JSON.stringify(json, null, 2))
            });
            return `${cid}`;
        });
    }
}
class PinataIpfsClient {
    constructor(apiKey, secret) {
        this._pinata = pinataSDK(apiKey, secret);
    }
    uploadFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const str = fs.createReadStream(filePath, 'utf-8');
            const { IpfsHash } = yield this._pinata.pinFileToIPFS(str);
            return IpfsHash;
        });
    }
    uploadJson(json) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IpfsHash } = yield this._pinata.pinJSONToIPFS(json);
            return IpfsHash;
        });
    }
}
const instances = {};
/**
 * Get IPFS client instance.
 * @param url The IPFS API endpoint.
 * @returns {IpfsClient}
 */
export const getIpfsClient = (url) => {
    if (instances[url]) {
        return instances[url];
    }
    if (url.startsWith('pinata://')) {
        const [apiKey, secret] = url.substring(9).split(':');
        instances[url] = new PinataIpfsClient(apiKey, secret);
    }
    else {
        instances[url] = new SimpleIpfsClient(url);
    }
    return instances[url];
};
