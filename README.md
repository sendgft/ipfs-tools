# IPFS tools

IPFS tools for [sendgft](https://github.com/sendgft).

## Commands

**daemon: run local IPFS daemon**

```
yarn ipfs-sendgft daemon
```

This will start a local IPFS daemon in *test* mode. The endpoints will be:

* API: http://127.0.0.1:5001/api/v0
* HTTP Gateway base URL: http://127.0.0.1:5002/ipfs

_Note: Ensure the [IPFS daemon software](https://ipfs.io/) is installed_.

**write-default-metadata: setup default IPFS NFT metadata**

```
yarn ipfs-sendgft write-default-metadata --api URL --gateway URL --rpc URL --mnemonic mnemonic --contract address
```

This does two things:

1. Writes default greeting card NFT metadata JSON to the given IPFS endpoint, and obtains a CID
2. Writes the CID and IFPS gateway base URL to the given on-chain [Gifter smart contract](https://github.com/sendgft/contracts)

_Note: It is assumed that the supplied wallet address is the admin for the given smart contract_.

Parameter info:

```
  --api URL             IPFS API endpoint URL.                  
  --gateway URL         IPFS gateway base URL.                  
  --rpc URL             EVM chain RPC endpoint URL.             
  --mnemonic mnemonic   Ethereum wallet mnemonic.               
  --contract address    On-chain Gifter smart contract address. 
```

**help: get command help**

Get help on all available commands.

```
yarn ipfs-sendgft help
```
