# Ethereum Access Token Helpers

Utilities for the Ethereum Access Token smart contract system.

Use these tools to help you generate and sign your EATs. First ensure that your smart contracts follow appropriate EAT interfaces by ensuring all functions that intend to be modified with `requiresAuth` to use the following parameters prepended before your usual function parameters:

```solidity
function yourFunction(uint8 v, bytes32 r, bytes32 s, uint256 expiry, ...) {}
```

where you insert your own function parameters in place of `...`.

## Install

Using npm:
`npm install @violetprotocol/ethereum-access-token-helpers`

Using yarn:
`yarn add @violetprotocol/ethereum-access-token-helpers`

## Usage

```typescript
import { splitSignature } from "@ethersproject/bytes";
const {
  signAuthMessage,
  getSignerFromMnemonic, getSignerFromPrivateKey
  packParameters
} = require("@violetprotocol/ethereum-access-token-helpers/utils");

const INTERVAL: number = 100 // seconds
const FUNCTION_SIGNATURE = "0xabcdefgh";
const CONTRACT: ethers.Contract = ...;
const SIGNER: ethers.Signer = ...;
const CALLER: ethers.Signer = ...;
const VERIFIER = "0x..."; // AuthVerifier contract address

// AuthToken domain for clear namespacing
const authDomain = {
  name: "Ethereum Access Token",
  version: "1",
  chainId: SIGNER.getChainId(),
  verifyingContract: VERIFIER,
};

// Construct AuthToken message with relevant data
const authMessage = {
  expiry: Math.floor(new Date().getTime() / 1000) + interval,
  functionCall: {
    functionSignature:  FUNCTION_SIGNATURE,
    target:             CONTRACT.address.toLowerCase(),
    caller:             CALLER.address.toLowerCase(),
    parameters:         packParameters(CONTRACT.interface, "functionName", [...params]),
  },
};

// Sign the AuthToken using the Signer
const signature = splitSignature(await signAuthMessage(SIGNER, this.domain, authMessage));

// Pass all signed data to a transaction function call
await CONTRACT.functionName(
  signature.v,
  signature.r,
  signature.s,
  authMessage.expiry,
  ...params
)
```
