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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIpfsClient = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ipfs_http_client_1 = require("ipfs-http-client");
const sdk_1 = __importDefault(require("@pinata/sdk"));
const got_1 = __importDefault(require("got"));
const _getFilename = (filePath) => filePath.substring(filePath.lastIndexOf('/') + 1);
class IpfsClient {
    /**
     * Upload file to IPFS.
     *
     * @param filePath The file path to upload from.
     * @param options upload options.
     * @returns CID.
     */
    uploadFile(filePath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // extract extension
            filePath = path_1.default.resolve(filePath);
            const ret = yield this._uploadFile(filePath, options);
            yield this._postProcessUpload(ret, options);
            return ret;
        });
    }
    /**
     * Upload folder and its subcontents to IPFS.
     *
     * @param folderPath The folder path to upload from.
     * @param options upload options.
     * @returns CID.
     */
    uploadFolder(folderPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // extract extension
            folderPath = path_1.default.resolve(folderPath);
            const ret = yield this._uploadFolder(folderPath, options);
            yield this._postProcessUpload(ret, options);
            return ret;
        });
    }
    /**
     * Upload JSON to IPFS.
     *
     * @param json The JSON.
     * @param options upload options.
     * @returns CID.
     */
    uploadJson(json, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = yield this._uploadJson(json);
            yield this._postProcessUpload(ret, options);
            return ret;
        });
    }
    /**
     * Post-process an upload.
     *
     * @param result The result.
     * @param options upload options.
     */
    _postProcessUpload(result, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options === null || options === void 0 ? void 0 : options.verifyViaGateway) {
                const url = `${options.verifyViaGateway}${result.path}`;
                try {
                    yield (0, got_1.default)(url); // this will throw if there is an error
                }
                catch (err) {
                    throw new Error(`Unable to verify existence of CID via gateway: ${url}`);
                }
            }
        });
    }
}
class SimpleIpfsClient extends IpfsClient {
    constructor(url) {
        super();
        this._client = (0, ipfs_http_client_1.create)({ url, timeout: 10000 });
    }
    _uploadFile(filePath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = _getFilename(filePath);
            const cidPath = (options === null || options === void 0 ? void 0 : options.wrapWithDirectory) ? `/root/${name}` : undefined;
            const { cid } = yield this._client.add({
                content: fs_1.default.createReadStream(filePath),
                path: cidPath,
            });
            return { cid: `${cid}`, path: `${cid}${cidPath ? `/${name}` : ''}` };
        });
    }
    _uploadFolder(folderPath, options) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const iter = this._client.addAll((0, ipfs_http_client_1.globSource)(folderPath, { recursive: true }), { pin: true, wrapWithDirectory: true });
            const ret = [];
            try {
                for (var iter_1 = __asyncValues(iter), iter_1_1; iter_1_1 = yield iter_1.next(), !iter_1_1.done;) {
                    const item = iter_1_1.value;
                    ret.push(item);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (iter_1_1 && !iter_1_1.done && (_a = iter_1.return)) yield _a.call(iter_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            const { cid } = ret[ret.length - 2];
            return { cid: `${cid}`, path: `${cid}` };
        });
    }
    _uploadJson(json) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cid } = yield this._client.add({
                content: Buffer.from(JSON.stringify(json, null, 2))
            });
            return { cid: `${cid}`, path: `${cid}` };
        });
    }
}
class PinataIpfsClient extends IpfsClient {
    constructor(apiKey, secret) {
        super();
        this._pinata = (0, sdk_1.default)(apiKey, secret);
    }
    _uploadFile(filePath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = _getFilename(filePath);
            const { IpfsHash } = yield this._pinata.pinFromFS(filePath, {
                pinataOptions: {
                    wrapWithDirectory: !!(options === null || options === void 0 ? void 0 : options.wrapWithDirectory)
                }
            });
            return { cid: `${IpfsHash}`, path: `${IpfsHash}${(options === null || options === void 0 ? void 0 : options.wrapWithDirectory) ? `/${name}` : ''}` };
        });
    }
    _uploadFolder(folderPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IpfsHash } = yield this._pinata.pinFromFS(folderPath);
            return { cid: `${IpfsHash}`, path: `${IpfsHash}` };
        });
    }
    _uploadJson(json) {
        return __awaiter(this, void 0, void 0, function* () {
            const { IpfsHash } = yield this._pinata.pinJSONToIPFS(json);
            return { cid: `${IpfsHash}`, path: `${IpfsHash}` };
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
