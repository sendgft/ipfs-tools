export declare class IpfsClient {
    static instances: Record<string, IpfsClient>;
    private _client;
    /**
     * Constructor.
     *
     * @param url The IFPS API endpoint.
     */
    constructor(url: string);
    /**
     * Upload string to IPFS.
     *
     * @param str The string.
     * @param filePath The file path to upload at.
     * @returns CID & other info.
     */
    uploadString(str: string, filePath?: string): Promise<import("ipfs-core-types/src/root").AddResult>;
    /**
     * Upload JSON to IPFS.
     *
     * @param json The JSON.
     * @param filePath The file path to upload at.
     * @returns CID & other info.
     */
    uploadJson(json: object, filePath?: string): Promise<import("ipfs-core-types/src/root").AddResult>;
}
/**
 * Get IPFS client instance.
 * @param url The IPFS API endpoint.
 * @returns {IpfsClient}
 */
export declare const getIpfsClient: (url: string) => IpfsClient;
