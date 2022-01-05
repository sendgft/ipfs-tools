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
    const GFT_OPENED_SVG = fs.readFileSync(path.join(process.cwd(), 'data', 'gft-opened.svg'), 'utf-8');
    const GFT_UNOPENED_SVG = fs.readFileSync(path.join(process.cwd(), 'data', 'gft-unopened.svg'), 'utf-8');
    const ipfsClient = getIpfsClient(api);
    const openedGfImgCid = yield tryCatch('Upload "opened GFT" image to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const cid = yield ipfsClient.uploadString(GFT_OPENED_SVG);
        log(`Opened GFT image CID: ${cid}`);
        return cid;
    }));
    const unopenedGfImgCid = yield tryCatch('Upload "unopened GFT" image to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const cid = yield ipfsClient.uploadString(GFT_UNOPENED_SVG);
        log(`Unopened GFT image CID: ${cid}`);
        return cid;
    }));
    if (gateway.substring(-1) !== '/') {
        gateway = `${gateway}/`;
    }
    const openedGfImgUrl = `${gateway}${openedGfImgCid}`;
    const unopenedGfImgUrl = `${gateway}${unopenedGfImgCid}`;
    // check gateway access
    yield tryCatch(`Check that "opened GFT" image exists: ${openedGfImgUrl}`, () => __awaiter(void 0, void 0, void 0, function* () {
        const ret = yield got(openedGfImgUrl);
        if (ret.body !== GFT_OPENED_SVG) {
            throw new Error(`Unable to verify "opened GFT" image via gateway: ${openedGfImgUrl}`);
        }
    }));
    yield tryCatch(`Check that "unopened GFT" image exists: ${unopenedGfImgUrl}`, () => __awaiter(void 0, void 0, void 0, function* () {
        const ret = yield got(unopenedGfImgUrl);
        if (ret.body !== GFT_UNOPENED_SVG) {
            throw new Error(`Unable to verify "unopened GFT" image via gateway: ${unopenedGfImgUrl}`);
        }
    }));
    // upload metadata
    const cid = yield tryCatch('Upload metadata to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const cid = yield ipfsClient.uploadJson({
            name: 'Unopened GFT',
            description: 'This is an unopened GFT sent via https://gft.xyz',
            image: openedGfImgUrl,
        });
        log(`Unopened GFT metadata CID: ${cid}`);
        return cid;
    }));
    log(`Default metadata CID: ${cid}`);
    log(`Opened GFT image URL: ${openedGfImgUrl}`);
});
