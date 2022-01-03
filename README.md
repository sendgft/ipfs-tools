# IPFS tools

IPFS tools for [sendgft](https://github.com/sendgft).

## Commands

**Run local IPFS daemon**

This will start a local IPFS daemon in *test* mode. The endpoints will be:

* API: http://127.0.0.1:5001/api/v0
* HTTP Gateway base URL: http://127.0.0.1:5002/ipfs

_Note: Ensure the [IPFS daemon software](https://ipfs.io/) is installed_.

```
yarn ipfs-sendgft daemon
```

**Setup default IPFS NFT metadata**

This does two things:

1. Writes default greeting card NFT metadata JSON to the given IPFS endpoint, and obtained a CID
2. Writes the CID and IFPS gateway base URL to the given on-chain [Gifter smart contract](https://github.com/sendgft/contracts)

_Note: It is assumed that the supplied wallet address is the admin for the given smart contract_.

```
yarn ipfs-sendgft write-default-metadata --api <ipfs api endpont> --gateway <ipfs gateway base URL> --chain <evm chain id> --contract <contract address> --mnemonic <wallet mnemonic>
```

**Help**

```
yarn ipfs-sendgft help
```
