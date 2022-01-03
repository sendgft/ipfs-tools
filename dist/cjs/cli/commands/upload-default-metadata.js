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
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.getMeta = void 0;
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
    ]
});
exports.getMeta = getMeta;
const DEFAULT_METADATA = {
    name: 'Unopened GFT',
    description: 'This is an unopened GFT sent via https://gft.xyz',
    image: 'https://www.kornferry.com/content/dam/kornferry/insights-images/articles/BurnisonDec13.20Home.jpg',
};
const execute = ({ api }) => __awaiter(void 0, void 0, void 0, function* () {
    const ipfsClient = (0, __1.getIpfsClient)(api);
    const cid = yield (0, utils_1.tryCatch)('Upload metadata to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const { cid } = yield ipfsClient.uploadJson(DEFAULT_METADATA);
        (0, utils_1.log)(`CID: ${cid}`);
        return cid;
    }));
});
exports.execute = execute;
