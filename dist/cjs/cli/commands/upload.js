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
const got_1 = __importDefault(require("got"));
const __1 = require("../..");
const utils_1 = require("../../utils");
const getMeta = () => ({
    summary: 'Upload a file to IPFS.',
    params: [
        {
            name: 'file',
            typeLabel: '{underline path}',
            description: 'The path to the file.',
        },
    ],
    options: [
        {
            name: 'api',
            description: 'IPFS API endpoint URL.',
            defaultValue: 'http://127.0.0.1:5001/api/v0',
        },
        {
            name: 'gateway',
            description: 'IPFS gateway base URL.',
            defaultValue: 'http://127.0.0.1:5002/ipfs',
        },
    ]
});
exports.getMeta = getMeta;
const execute = ({ file, api, gateway }) => __awaiter(void 0, void 0, void 0, function* () {
    const ipfsClient = (0, __1.getIpfsClient)(api);
    const ret = yield (0, utils_1.tryCatch)(`Upload "${file}" to IPFS`, () => __awaiter(void 0, void 0, void 0, function* () {
        const ret = yield ipfsClient.uploadFile(file);
        (0, utils_1.log)(`CID = ${ret.cid}`);
        (0, utils_1.log)(`Path = ${ret.path}`);
        return ret;
    }));
    if (gateway.substring(-1) !== '/') {
        gateway = `${gateway}/`;
    }
    const url = `${gateway}${ret.path}`;
    // check gateway access
    yield (0, utils_1.tryCatch)(`Check that file can be served from gateway: ${url}`, () => __awaiter(void 0, void 0, void 0, function* () {
        const ret = yield (0, got_1.default)(url);
        const expected = fs_1.default.readFileSync(file, { encoding: 'utf-8' }).toString();
        if (ret.body !== expected) {
            throw new Error(`Unable to verify file image via gateway: ${url}`);
        }
    }));
});
exports.execute = execute;
