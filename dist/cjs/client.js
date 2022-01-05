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
const fs_1 = __importDefault(require("fs"));
const ipfs_http_client_1 = require("ipfs-http-client");
const sdk_1 = __importDefault(require("@pinata/sdk"));
class SimpleIpfsClient {
    constructor(url) {
        this._client = (0, ipfs_http_client_1.create)({ url, timeout: 10000 });
    }
    uploadFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = fs_1.default.readFileSync(filePath, { encoding: 'utf-8' });
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
        this._pinata = (0, sdk_1.default)(apiKey, secret);
    }
    uploadFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const str = fs_1.default.createReadStream(filePath, 'utf-8');
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
const getIpfsClient = (url) => {
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
exports.getIpfsClient = getIpfsClient;
