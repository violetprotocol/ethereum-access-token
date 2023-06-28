import "@nomiclabs/hardhat-waffle";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer";

import "./tasks";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";

dotenvConfig({ path: resolve(__dirname, "./.env") });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
const privateKey: string | undefined = process.env.PRIVATE_KEY;

enum RpcProvider {
  INFURA = "infura",
  ALCHEMY = "alchemy",
}

const RPC_PROVIDER: RpcProvider = RpcProvider.ALCHEMY;

if (!privateKey && !mnemonic) {
  throw new Error("Please set your PRIVATE_KEY or MNEMONIC in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (RPC_PROVIDER == RpcProvider.INFURA && !infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

const chainIds = {
  "arbitrum-goerli": 421613,
  arbitrumOne: 42161,
  avalanche: 43114,
  bsc: 56,
  hardhat: 31337,
  mainnet: 1,
  optimism: 10,
  optimismGoerli: 420,
  "polygon-mainnet": 137,
  "polygon-mumbai": 80001,
  rinkeby: 4,
  kovan: 42,
};

const getAlchemyUrl = (network: keyof typeof chainIds) => {
  switch (network) {
    case "arbitrumOne":
      return process.env.ARBITRUM_ONE_RPC_URL;
    case "optimism":
      return process.env.OPTIMISM_MAINNET_RPC_URL;
    case "optimismGoerli":
      return process.env.OPTIMISM_GOERLI_RPC_URL;
    case "mainnet":
      return process.env.ETHEREUM_MAINNET_RPC_URL;
    case "polygon-mumbai":
      return process.env.POLYGON_MUMBAI_RPC_URL;
    case "polygon-mainnet":
      return process.env.POLYGON_MAINNET_RPC_URL;
    default:
      throw new Error(`No Alchemy URL configured for the ${network} network`);
  }
};

const getChainUrl = (network: keyof typeof chainIds): string | undefined => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (RPC_PROVIDER == RpcProvider.INFURA) {
    return "https://" + network + ".infura.io/v3/" + infuraApiKey;
  } else if (RPC_PROVIDER == RpcProvider.ALCHEMY) {
    const url = getAlchemyUrl(network);
    return url;
  }
};

function getChainConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url = getChainUrl(network);
  if (!url) throw new Error(`Missing RPC URL for network ${network}`);

  let accounts;

  // Prioritise private key if it is available
  if (privateKey) accounts = [`0x${process.env.PRIVATE_KEY}`];
  else if (mnemonic)
    accounts = {
      count: 20,
      mnemonic,
      path: "m/44'/60'/0'/0",
    };

  return {
    accounts,
    chainId: chainIds[network],
    url,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  etherscan: {
    apiKey: {
      mainnet: `${process.env.ETHERSCAN_API_KEY}`,
      arbitrumOne: `${process.env.ARBSCAN_API_KEY}`,
      optimisticEthereum: `${process.env.OPTIMISM_API_KEY}`,
      optimisticGoerli: `${process.env.OPTIMISM_API_KEY}`,
    },
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    arbitrumOne: getChainConfig("arbitrumOne"),
    // arbitrumGoerli: getChainConfig("arbitrum-goerli"),
    // avalanche: getChainConfig("avalanche"),
    // bsc: getChainConfig("bsc"),
    mainnet: getChainConfig("mainnet"),
    optimism: getChainConfig("optimism"),
    optimismGoerli: getChainConfig("optimismGoerli"),
    polygon: getChainConfig("polygon-mainnet"),
    polygonMumbai: getChainConfig("polygon-mumbai"),
    // rinkeby: getChainConfig("rinkeby"),
    // kovan: getChainConfig("kovan"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.13",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },
};

export default config;
