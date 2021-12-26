export declare class IpfsClient {
    static instances: Record<string, IpfsClient>;
    private _client;
    constructor(url: string);
    uploadString(str: string, filePath?: string): Promise<import("ipfs-core-types/src/root").AddResult>;
    uploadJson(json: object, filePath?: string): Promise<import("ipfs-core-types/src/root").AddResult>;
}
export declare const getIpfsClient: (url: string) => IpfsClient;
