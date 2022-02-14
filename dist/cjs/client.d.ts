export interface IpfsUploadOptions {
    /**
     * Gateway URL (with trailing slash) through which to verify the upload.
     */
    verifyViaGateway?: string;
}
interface IpfsUploadResult {
    cid: string;
    path: string;
}
declare abstract class IpfsClient {
    /**
     * Upload file to IPFS.
     *
     * @param filePath The file path to upload from.
     * @param options upload options.
     * @returns CID.
     */
    uploadFile(filePath: string, options?: IpfsUploadOptions): Promise<IpfsUploadResult>;
    /**
     * Upload JSON to IPFS.
     *
     * @param json The JSON.
     * @param options upload options.
     * @returns CID.
     */
    uploadJson(json: object, options?: IpfsUploadOptions): Promise<IpfsUploadResult>;
    /**
     * Upload file to IPFS.
     *
     * @param filePath The file path to upload from.
     * @returns CID.
     */
    protected abstract _uploadFile(filePath: string): Promise<IpfsUploadResult>;
    /**
     * Upload JSON to IPFS.
     *
     * @param json The JSON.
     * @returns CID.
     */
    protected abstract _uploadJson(json: object): Promise<IpfsUploadResult>;
    /**
     * Post-process an upload.
     *
     * @param result The result.
     * @param options upload options.
     */
    protected _postProcessUpload(result: IpfsUploadResult, options?: IpfsUploadOptions): Promise<void>;
}
/**
 * Get IPFS client instance.
 * @param url The IPFS API endpoint.
 * @returns {IpfsClient}
 */
export declare const getIpfsClient: (url: string) => IpfsClient;
export {};
