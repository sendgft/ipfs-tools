var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getIpfsClient } from '../..';
import { log, tryCatch } from '../utils';
export const getMeta = () => ({
    summary: 'Write sendGFT default metadata to IPFS and on-chain contract.',
    params: [
        {
            name: 'api',
            typeLabel: '{underline URL}',
            description: 'IPFS API endpoint URL.'
        },
    ]
});
const DEFAULT_METADATA = {
    name: 'Unopened GFT',
    description: 'This is an unopened GFT sent via https://gft.xyz',
    image: 'https://www.kornferry.com/content/dam/kornferry/insights-images/articles/BurnisonDec13.20Home.jpg',
};
export const execute = ({ api }) => __awaiter(void 0, void 0, void 0, function* () {
    const ipfsClient = getIpfsClient(api);
    const cid = yield tryCatch('Upload metadata to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const { cid } = yield ipfsClient.uploadJson(DEFAULT_METADATA);
        log(`CID: ${cid}`);
        return cid;
    }));
});
