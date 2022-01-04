"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIpfsClient = void 0;
const stream_1 = require("stream");
const buffer_1 = require("buffer");
const ipfs_http_client_1 = require("ipfs-http-client");
const sdk_1 = __importDefault(require("@pinata/sdk"));
class IpfsClient {
    /**
     * Upload string to IPFS.
     *
     * @param str The string.
     * @param filePath The file path to upload at.
     * @returns CID.
     */
    uploadString(str) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not implemented');
        });
    }
    /**
     * Upload JSON to IPFS.
     *
     * @param json The JSON.
     * @param filePath The file path to upload at.
     * @returns CID.
     */
    uploadJson(json) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.uploadString(JSON.stringify(json, null, 2));
        });
    }
}
class SimpleIpfsClient extends IpfsClient {
    constructor(url) {
        super();
        this._client = (0, ipfs_http_client_1.create)({ url, timeout: 10000 });
    }
    uploadString(str) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cid } = yield this._client.add({
                content: buffer_1.Buffer.from(str)
            });
            return `${cid}`;
        });
    }
}
class PinatapfsClient extends IpfsClient {
    constructor(apiKey, secret) {
        super();
        this._pinata = (0, sdk_1.default)(apiKey, secret);
    }
    uploadString(str) {
        return __awaiter(this, void 0, void 0, function* () {
            const strStream = stream_1.Readable.from(str);
            const { IpfsHash } = yield this._pinata.pinFileToIPFS(strStream);
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
const getIpfsClient = (url) => {
    if (instances[url]) {
        return instances[url];
    }
    if (url.startsWith('pinata://')) {
        const [apiKey, secret] = url.substring(9).split(':');
        instances[url] = new PinatapfsClient(apiKey, secret);
    }
    else {
        instances[url] = new SimpleIpfsClient(url);
    }
    return instances[url];
};
exports.getIpfsClient = getIpfsClient;
