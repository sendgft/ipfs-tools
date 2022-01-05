interface IpfsClient {
    /**
     * Upload string to IPFS.
     *
     * @param filePath The file path to upload from.
     * @returns CID.
     */
    uploadFile: (filePath: string) => Promise<string>;
    /**
     * Upload JSON to IPFS.
     *
     * @param json The JSON.
     * @param filePath The file path to upload at.
     * @returns CID.
     */
    uploadJson: (json: object) => Promise<string>;
}
/**
 * Get IPFS client instance.
 * @param url The IPFS API endpoint.
 * @returns {IpfsClient}
 */
export declare const getIpfsClient: (url: string) => IpfsClient;
export {};
