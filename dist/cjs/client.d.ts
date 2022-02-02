export interface IpfsUploadOptions {
    /**
     * Gateway URL (with trailing slash) through which to verify the upload.
     */
    verifyViaGateway?: string;
}
declare abstract class IpfsClient {
    /**
     * Upload file to IPFS.
     *
     * @param filePath The file path to upload from.
     * @param options upload options.
     * @returns CID.
     */
    uploadFile(filePath: string, options?: IpfsUploadOptions): Promise<string>;
    /**
     * Upload JSON to IPFS.
     *
     * @param json The JSON.
     * @param options upload options.
     * @returns CID.
     */
    uploadJson(json: object, options?: IpfsUploadOptions): Promise<string>;
    /**
     * Upload file to IPFS.
     *
     * @param filePath The file path to upload from.
     * @returns CID.
     */
    protected abstract _uploadFile(filePath: string): Promise<string>;
    /**
     * Upload JSON to IPFS.
     *
     * @param json The JSON.
     * @returns CID.
     */
    protected abstract _uploadJson(json: object): Promise<string>;
    /**
     * Post-process an upload.
     *
     * @param cid The CID.
     * @param options upload options.
     */
    protected _postProcessUpload(cid: string, options?: IpfsUploadOptions): Promise<void>;
}
/**
 * Get IPFS client instance.
 * @param url The IPFS API endpoint.
 * @returns {IpfsClient}
 */
export declare const getIpfsClient: (url: string) => IpfsClient;
export {};
