# Ethereum Access Token

Implemention of [EIP-712](https://eips.ethereum.org/EIPS/eip-721) for access signed access token verification.

Tokens authorise a user to perform specific on-chain interactions as determined by the token issuer.

Tokens are in the form:

```json
{
  "expiry": <unix_seconds-uint256>,
  "functionCall": {
    "name": <name_of_function-string>,
    "target": <contract_address_of_tx_target-string>,
    "caller": <user_address_of_tx_caller-string>,
    "parameters": [
      {
        "typ": <solidity_type_of_parameter-string>,
        "value": 0x<hexadecimal_representation_of_parameter_value-string>
      },
    ]
  }
}
```

Tokens are signed according to [EIP-712](https://eips.ethereum.org/EIPS/eip-721) using `signTypedData` and are verified on-chain through the `Auth.sol` contract `verify` function.

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
