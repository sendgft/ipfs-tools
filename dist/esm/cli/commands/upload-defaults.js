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
import { log, tryCatch } from '../../utils';
export const getMeta = () => ({
    summary: 'Write sendGFT default metadata to IPFS and on-chain contract.',
    params: [
        {
            name: 'api',
            typeLabel: '{underline URL}',
            description: 'IPFS API endpoint URL.',
            defaultOption: ';http://127.0.0.1:5001/api/v0',
        },
        {
            name: 'gateway',
            typeLabel: '{underline URL}',
            description: 'IPFS gateway base URL.',
            defaultOption: 'http://127.0.0.1:5002/ipfs',
        },
    ]
});
export const execute = ({ api, gateway }) => __awaiter(void 0, void 0, void 0, function* () {
    const GFT_OPENED_SVG = path.join(process.cwd(), 'data', 'gft-opened.svg');
    const GFT_UNOPENED_SVG = path.join(process.cwd(), 'data', 'gft-unopened.svg');
    const ipfsClient = getIpfsClient(api);
    const openedGfImgCid = yield tryCatch('Upload "opened GFT" image to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const cid = yield ipfsClient.uploadFile(GFT_OPENED_SVG);
        log(`Opened GFT image CID: ${cid}`);
        return cid;
    }));
    const unopenedGfImgCid = yield tryCatch('Upload "unopened GFT" image to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const cid = yield ipfsClient.uploadFile(GFT_UNOPENED_SVG);
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
        const expected = fs.readFileSync(GFT_OPENED_SVG, { encoding: 'utf-8' }).toString();
        if (ret.body !== expected) {
            throw new Error(`Unable to verify "opened GFT" image via gateway: ${openedGfImgUrl}`);
        }
    }));
    yield tryCatch(`Check that "unopened GFT" image exists: ${unopenedGfImgUrl}`, () => __awaiter(void 0, void 0, void 0, function* () {
        const ret = yield got(unopenedGfImgUrl);
        const expected = fs.readFileSync(GFT_UNOPENED_SVG, { encoding: 'utf-8' }).toString();
        if (ret.body !== expected) {
            throw new Error(`Unable to verify "unopened GFT" image via gateway: ${unopenedGfImgUrl}`);
        }
    }));
    // upload metadata
    const cid = yield tryCatch('Upload metadata to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const cid = yield ipfsClient.uploadJson({
            name: 'Unopened GFT',
            description: 'This is an unopened GFT sent via https://gft.xyz',
            image: unopenedGfImgUrl,
        });
        log(`Unopened GFT metadata CID: ${cid}`);
        return cid;
    }));
    log(`Default metadata CID: ${cid}`);
    log(`Opened GFT image CID: ${openedGfImgCid}`);
});
