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
    const GFT_OPENED_SVG = path_1.default.join(process.cwd(), 'data', 'gft-opened.svg');
    const GFT_UNOPENED_SVG = path_1.default.join(process.cwd(), 'data', 'gft-unopened.svg');
    const ipfsClient = (0, __1.getIpfsClient)(api);
    const openedGfImgCid = yield (0, utils_1.tryCatch)('Upload "opened GFT" image to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const cid = yield ipfsClient.uploadFile(GFT_OPENED_SVG);
        (0, utils_1.log)(`Opened GFT image CID: ${cid}`);
        return cid;
    }));
    const unopenedGfImgCid = yield (0, utils_1.tryCatch)('Upload "unopened GFT" image to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const cid = yield ipfsClient.uploadFile(GFT_UNOPENED_SVG);
        (0, utils_1.log)(`Unopened GFT image CID: ${cid}`);
        return cid;
    }));
    if (gateway.substring(-1) !== '/') {
        gateway = `${gateway}/`;
    }
    const openedGfImgUrl = `${gateway}${openedGfImgCid}`;
    const unopenedGfImgUrl = `${gateway}${unopenedGfImgCid}`;
    // check gateway access
    yield (0, utils_1.tryCatch)(`Check that "opened GFT" image exists: ${openedGfImgUrl}`, () => __awaiter(void 0, void 0, void 0, function* () {
        const ret = yield (0, got_1.default)(openedGfImgUrl);
        const expected = fs_1.default.readFileSync(GFT_OPENED_SVG, { encoding: 'utf-8' }).toString();
        if (ret.body !== expected) {
            throw new Error(`Unable to verify "opened GFT" image via gateway: ${openedGfImgUrl}`);
        }
    }));
    yield (0, utils_1.tryCatch)(`Check that "unopened GFT" image exists: ${unopenedGfImgUrl}`, () => __awaiter(void 0, void 0, void 0, function* () {
        const ret = yield (0, got_1.default)(unopenedGfImgUrl);
        const expected = fs_1.default.readFileSync(GFT_UNOPENED_SVG, { encoding: 'utf-8' }).toString();
        if (ret.body !== expected) {
            throw new Error(`Unable to verify "unopened GFT" image via gateway: ${unopenedGfImgUrl}`);
        }
    }));
    // upload metadata
    const cid = yield (0, utils_1.tryCatch)('Upload metadata to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const cid = yield ipfsClient.uploadJson({
            name: 'Unopened GFT',
            description: 'This is an unopened GFT sent via https://gft.xyz',
            image: unopenedGfImgUrl,
        });
        (0, utils_1.log)(`Unopened GFT metadata CID: ${cid}`);
        return cid;
    }));
    (0, utils_1.log)(`Default metadata CID: ${cid}`);
    (0, utils_1.log)(`Opened GFT image CID: ${openedGfImgCid}`);
});
exports.execute = execute;
