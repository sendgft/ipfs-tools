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
import path from 'path';
import got from 'got';
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
        {
            name: 'gateway',
            typeLabel: '{underline URL}',
            description: 'IPFS gateway base URL.'
        },
    ]
});
export const execute = ({ api, gateway }) => __awaiter(void 0, void 0, void 0, function* () {
    const UNOPENED_GFT_SVG = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'data', 'unopened-gft.svg'), 'utf-8');
    const ipfsClient = getIpfsClient(api);
    const unopenedGfImgCid = yield tryCatch('Upload default unopened image to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const { cid } = yield ipfsClient.uploadString(UNOPENED_GFT_SVG);
        log(`Unopened GFT CID: ${cid}`);
        return cid;
    }));
    if (gateway.substr(-1) !== '/') {
        gateway = `${gateway}/`;
    }
    const unopenedGfImgUrl = `${gateway}${unopenedGfImgCid}`;
    // check gateway access
    const ret = yield got(unopenedGfImgUrl);
    if (ret.body !== UNOPENED_GFT_SVG) {
        throw new Error(`Unable to verify unopened GFT image via gateway: ${unopenedGfImgUrl}`);
    }
    const cid = yield tryCatch('Upload metadata to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const { cid } = yield ipfsClient.uploadJson({
            name: 'Unopened GFT',
            description: 'This is an unopened GFT sent via https://gft.xyz',
            image: unopenedGfImgUrl,
        });
        log(`Default metadata CID: ${cid}`);
        return cid;
    }));
});
