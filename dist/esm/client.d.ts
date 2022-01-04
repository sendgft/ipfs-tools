export interface IpfsClient {
    /**
     * Upload string to IPFS.
     *
     * @param str The string.
     * @param filePath The file path to upload at.
     * @returns CID.
     */
    uploadString: (str: string) => Promise<string>;
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
