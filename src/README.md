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
const { splitSignature } = require("@ethersproject/bytes");
const {
  signAuthMessage,
  getSignerFromMnemonic, getSignerFromPrivateKey
  packParameters
} = require("@violetprotocol/ethereum-access-token-helpers/utils");

const INTERVAL: number = 100 // seconds
const FUNCTION_SIGNATURE = "0xabcdefgh";
const CONTRACT: ethers.Contract = ...; // for example an ERC20 token contract
const SIGNER: ethers.Signer = ...;
const CALLER: ethers.Signer = ...;
const VERIFIER = "0x..."; // AuthVerifier contract address

const recipient = "0x123...";
const amount = 1;

// AuthToken domain for clear namespacing
const authDomain = {
  name: "Ethereum Access Token",
  version: "1",
  chainId: SIGNER.getChainId(),
  verifyingContract: VERIFIER,
};

// Construct AuthToken message with relevant data using ERC20 `transfer(address to, uint256 amount)` as the example tx
// In the Auth compatible case, the ERC20 transfer function actually looks like this:
// `transfer(uint8 v, bytes32 r, bytes32 s, uint256 expiry, address to, uint256 amount)`
// where we just augment the original function with the required parameters for auth
// the `parameters` property takes a packed, abi-encoded set of original function parameters
const authMessage = {
  expiry: Math.floor(new Date().getTime() / 1000) + interval,
  functionCall: {
    functionSignature:  FUNCTION_SIGNATURE,
    target:             CONTRACT.address.toLowerCase(),
    caller:             CALLER.address.toLowerCase(),
    parameters:         packParameters(CONTRACT.interface, "transfer", [recipient, amount]),
  },
};

// Sign the AuthToken using the Signer
const signature = splitSignature(await signAuthMessage(SIGNER, authDomain, authMessage));

// Pass all signed data to a transaction function call
await CONTRACT.functionName(
  signature.v,
  signature.r,
  signature.s,
  authMessage.expiry,
  ...params
)
```
