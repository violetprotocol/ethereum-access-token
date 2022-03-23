import { ethers } from "ethers";
import "dotenv";

// Returns a Wallet object instantiated using 12-word Mnemonic:
// https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
const getSignerFromMnemonic = (): ethers.Wallet => {
  return ethers.Wallet.fromMnemonic(process.env.MNEMONIC as string);
};

// Returns a Wallet object instantiated using a raw private key
const getSignerFromPrivateKey = (): ethers.Wallet => {
  return new ethers.Wallet(process.env.PRIVATE_KEY as string);
};

export { getSignerFromMnemonic, getSignerFromPrivateKey };
