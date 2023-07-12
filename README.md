# Ethereum Access Token


Implemention of [EIP-712](https://eips.ethereum.org/EIPS/eip-721) for signed access token verification.

Tokens authorise a user to perform specific on-chain interactions as determined by the token issuer.

Tokens are in the form:

```json
{
  "expiry": <unix_seconds-uint256>,
  "functionCall": {
    "functionSignature": <solidity_function_sig_hex-string>,
    "target": <contract_address_of_tx_target-string>,
    "caller": <user_address_of_tx_caller-string>,
    "parameters": <hexadecimal_representation_of_parameters-string>
  }
}
```

Tokens are signed according to [EIP-712](https://eips.ethereum.org/EIPS/eip-721) using `signTypedData` and are verified on-chain through the `Auth.sol` contract `verify` function.

Parameters are abi-encoded similarly to how solidity does it. This is to ensure that we are signing the data that we expect to see during the transaction. Due to the entrypoint transaction containing signature-relevant parts, these parameters will be excluding all parts relating to the signature and expiry of the AuthToken. Example:

If the function to be called is the following:

```solidity
function transfer(address recipient, uint256 amount) public;

```

then the version that requires authorisation is the following:

```solidity
function tranfer(
  uint8 v,
  bytes32 r,
  bytes32 s,
  uint256 expiry,
  address recipient,
  uint256 amount
) public requiresAuth;

```

and parameters to the function are the original `address recipient` and `uint256 amount` which will be encoded as follows:
`abi.encodeWithSignature('transfer(address,uint256)', recipient, amount)`

## Usage

### Pre Requisites

Before running any command, you need to create a `.env` file and set a BIP-39 compatible mnemonic as an environment
variable. Follow the example in `.env.example`. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.

Then, proceed with installing dependencies:

```sh
yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true yarn test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

### Deploy

Deploy the contracts to Hardhat Network:

```sh
$ yarn deploy --greeting "Bonjour, le monde!"
```

## Syntax Highlighting

If you use VSCode, you can enjoy syntax highlighting for your Solidity code via the
[vscode-solidity](https://github.com/juanfranblanco/vscode-solidity) extension. The recommended approach to set the
compiler version is to add the following fields to your VSCode user settings:

```json
{
  "solidity.compileUsingRemoteVersion": "v0.8.4+commit.c7e474f2",
  "solidity.defaultCompiler": "remote"
}
```

Where of course `v0.8.4+commit.c7e474f2` can be replaced with any other version.
