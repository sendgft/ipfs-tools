# IPFS tools

IPFS tools for [sendgft](https://github.com/sendgft).

This functions as both a library and CLI.


## Library

This exposes a single function - `getIpfsClient()` which is used as follows:

```js
import { getIpfsClient } from '@sendgft/ipfs'

// get client instance
const client = getIpfsClient('http://ipfs-endpoint-url/api/v0')

// upload string
const { cid } = await client.uploadString('test')

// upload string such that it will be available at path /file.txt
const { cid3 } = await client.uploadString('test', '/file.txt')

// upload json
const { cid2 } = await client.uploadJson({ test: true })

// upload json such that it will be available at path /file.txt
const { cid2 } = await client.uploadJson({ test: true }, '/file.txt')
```

## CLI Commands

### daemon

```
yarn ipfs-tools daemon
```

This will start a local IPFS daemon in *test* mode. The endpoints will be:

* API: http://127.0.0.1:5001/api/v0
* HTTP Gateway base URL: http://127.0.0.1:5002/ipfs

_Note: Ensure the [IPFS daemon software](https://ipfs.io/) is installed_.

### upload

```
yarn ipfs-tools upload-defaults --api URL --gateway URL
```

This uploads a file to IPFS and returns the relevant CIDs and URLs for use.

Parameter info:

```
  --api URL       IPFS API endpoint URL. 
  --gateway URL   IPFS gateway base URL. 
```

**Example: upload to local IPFS daemon**

```shell
yarn ipfs-tools upload --file ./test.png --api http://127.0.0.1:5001/api/v0 --gateway http://127.0.0.1:5002/ipfs
```

**Example: upload to Pinata**

```shell
yarn ipfs-tools upload --file ./test.png --api pinata://<pinata api key>:<pinata secret key> --gateway https://ipfs.gft.xyz/ipfs
```


### help

Get help on all available commands.

```
yarn ipfs-tools help
```


## Development

After cloning the repo you must build the code:

```shell
yarn build
```

To auto-rebuild on code changes:

```shell
yarn build-watch
```

## Publishing releases

```shell
yarn release
```

## License

MIT