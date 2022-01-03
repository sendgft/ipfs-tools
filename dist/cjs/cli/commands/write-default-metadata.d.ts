export declare const getMeta: () => {
    summary: string;
    params: {
        name: string;
        typeLabel: string;
        description: string;
    }[];
};
interface Params {
    api: string;
    gateway: string;
    rpc: string;
    contract: string;
    mnemonic: string;
}
export declare const execute: ({ api, gateway, rpc, contract: address, mnemonic, }: Params) => Promise<void>;
export {};
