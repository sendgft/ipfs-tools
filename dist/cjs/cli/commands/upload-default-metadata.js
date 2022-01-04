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
exports.execute = exports.getMeta = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const got_1 = __importDefault(require("got"));
const __1 = require("../..");
const utils_1 = require("../utils");
const getMeta = () => ({
    summary: 'Write sendGFT default metadata to IPFS and on-chain contract.',
    params: [
        {
            name: 'api',
            typeLabel: '{underline URL}',
            description: 'IPFS API endpoint URL.'
        },
        {
            name: 'gateway',
            typeLabel: '{underline URL}',
            description: 'IPFS gateway base URL.'
        },
    ]
});
exports.getMeta = getMeta;
const execute = ({ api, gateway }) => __awaiter(void 0, void 0, void 0, function* () {
    const UNOPENED_GFT_SVG = fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'data', 'unopened-gft.svg'), 'utf-8');
    const ipfsClient = (0, __1.getIpfsClient)(api);
    const unopenedGfImgCid = yield (0, utils_1.tryCatch)('Upload default unopened image to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const { cid } = yield ipfsClient.uploadString(UNOPENED_GFT_SVG);
        (0, utils_1.log)(`Unopened GFT CID: ${cid}`);
        return cid;
    }));
    if (gateway.substring(-1) !== '/') {
        gateway = `${gateway}/`;
    }
    const unopenedGfImgUrl = `${gateway}${unopenedGfImgCid}`;
    // check gateway access
    yield (0, utils_1.tryCatch)('Check that unopened GFT image is available on the gateway', () => __awaiter(void 0, void 0, void 0, function* () {
        const ret = yield (0, got_1.default)(unopenedGfImgUrl);
        if (ret.body !== UNOPENED_GFT_SVG) {
            throw new Error(`Unable to verify unopened GFT image via gateway: ${unopenedGfImgUrl}`);
        }
    }));
    // upload metadata
    const cid = yield (0, utils_1.tryCatch)('Upload metadata to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const { cid } = yield ipfsClient.uploadJson({
            name: 'Unopened GFT',
            description: 'This is an unopened GFT sent via https://gft.xyz',
            image: unopenedGfImgUrl,
        });
        (0, utils_1.log)(`Default metadata CID: ${cid}`);
        return cid;
    }));
});
exports.execute = execute;
