var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Contract } from '@ethersproject/contracts';
import got from 'got';
import { Wallet } from '@ethersproject/wallet';
import { JsonRpcProvider } from '@ethersproject/providers';
import { contracts } from '@sendgft/contracts';
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
        {
            name: 'rpc',
            typeLabel: '{underline URL}',
            description: 'EVM chain RPC endpoint URL.'
        },
        {
            name: 'mnemonic',
            typeLabel: '{underline mnemonic}',
            description: 'Ethereum wallet mnemonic.'
        },
        {
            name: 'contract',
            typeLabel: '{underline address}',
            description: 'On-chain Gifter smart contract address.'
        },
    ]
});
const DEFAULT_METADATA = {
    name: 'Unopened GFT',
    description: 'This is an unopened GFT sent via https://gft.xyz',
    image: 'https://www.kornferry.com/content/dam/kornferry/insights-images/articles/BurnisonDec13.20Home.jpg',
};
export const execute = ({ api, gateway, rpc, contract: address, mnemonic, }) => __awaiter(void 0, void 0, void 0, function* () {
    const ipfsClient = getIpfsClient(api);
    const cid = yield tryCatch('Upload metadata to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const { cid } = yield ipfsClient.uploadJson(DEFAULT_METADATA);
        log(`CID: ${cid}`);
        return cid;
    }));
    yield tryCatch('Test IPFS gateway access', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield got(`${gateway}/${cid}`);
        log(response.body);
        if (JSON.parse(response.body).name !== DEFAULT_METADATA.name) {
            throw new Error('JSON mismatch!');
        }
    }));
    const provider = yield tryCatch('Connect to blockchain', () => __awaiter(void 0, void 0, void 0, function* () {
        const provider = new JsonRpcProvider(rpc);
        const info = yield provider.getNetwork();
        log(`Network ${info.name} (${info.chainId})`);
        return provider;
    }));
    const wallet = yield tryCatch('Load wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        let wallet = Wallet.fromMnemonic(mnemonic);
        wallet = yield wallet.connect(provider);
        const bal = yield wallet.getBalance();
        log(`Wallet: ${wallet.address} (bal: ${bal})`);
        return wallet;
    }));
    const contract = yield tryCatch('Check access to on-chain contract', () => __awaiter(void 0, void 0, void 0, function* () {
        const { abi } = contracts.GifterImplementationV1;
        const contract = new Contract(address, abi, wallet);
        const admin = yield contract.getAdmin();
        log(`Contract admin: ${admin}`);
        if (admin.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(`Wallet is not the admin!`);
        }
        return contract;
    }));
    yield tryCatch('Contract: set default content hash', () => __awaiter(void 0, void 0, void 0, function* () {
        (yield yield contract.setDefaultContentHash(cid)).wait();
    }));
    yield tryCatch('Contract: set token base URI', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (yield contract.setBaseURI(gateway)).wait();
    }));
});
