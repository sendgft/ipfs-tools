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
const contracts_1 = require("@ethersproject/contracts");
const got_1 = __importDefault(require("got"));
const wallet_1 = require("@ethersproject/wallet");
const providers_1 = require("@ethersproject/providers");
const contracts_2 = require("@sendgft/contracts");
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
exports.getMeta = getMeta;
const DEFAULT_METADATA = {
    name: 'Unopened GFT',
    description: 'This is an unopened GFT sent via https://gft.xyz',
    image: 'https://www.kornferry.com/content/dam/kornferry/insights-images/articles/BurnisonDec13.20Home.jpg',
};
const execute = ({ api, gateway, rpc, contract: address, mnemonic, }) => __awaiter(void 0, void 0, void 0, function* () {
    const ipfsClient = (0, __1.getIpfsClient)(api);
    const cid = yield (0, utils_1.tryCatch)('Upload metadata to IPFS', () => __awaiter(void 0, void 0, void 0, function* () {
        const { cid } = yield ipfsClient.uploadJson(DEFAULT_METADATA);
        (0, utils_1.log)(`CID: ${cid}`);
        return cid;
    }));
    yield (0, utils_1.tryCatch)('Test IPFS gateway access', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, got_1.default)(`${gateway}/${cid}`);
        (0, utils_1.log)(response.body);
        if (JSON.parse(response.body).name !== DEFAULT_METADATA.name) {
            throw new Error('JSON mismatch!');
        }
    }));
    const provider = yield (0, utils_1.tryCatch)('Connect to blockchain', () => __awaiter(void 0, void 0, void 0, function* () {
        const provider = new providers_1.JsonRpcProvider(rpc);
        const info = yield provider.getNetwork();
        (0, utils_1.log)(`Network ${info.name} (${info.chainId})`);
        return provider;
    }));
    const wallet = yield (0, utils_1.tryCatch)('Load wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        let wallet = wallet_1.Wallet.fromMnemonic(mnemonic);
        wallet = yield wallet.connect(provider);
        const bal = yield wallet.getBalance();
        (0, utils_1.log)(`Wallet: ${wallet.address} (bal: ${bal})`);
        return wallet;
    }));
    const contract = yield (0, utils_1.tryCatch)('Check access to on-chain contract', () => __awaiter(void 0, void 0, void 0, function* () {
        const { abi } = contracts_2.contracts.GifterImplementationV1;
        const contract = new contracts_1.Contract(address, abi, wallet);
        const admin = yield contract.getAdmin();
        (0, utils_1.log)(`Contract admin: ${admin}`);
        if (admin.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(`Wallet is not the admin!`);
        }
        return contract;
    }));
    yield (0, utils_1.tryCatch)('Contract: set default content hash', () => __awaiter(void 0, void 0, void 0, function* () {
        (yield yield contract.setDefaultContentHash(cid)).wait();
    }));
    yield (0, utils_1.tryCatch)('Contract: set token base URI', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (yield contract.setBaseURI(gateway)).wait();
    }));
});
exports.execute = execute;
