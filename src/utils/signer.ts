import { ethers } from "ethers";
import "dotenv";

const getSignerFromMnemonic = (): ethers.Wallet => {
  return ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
};

const getSignerFromPrivateKey = (): ethers.Wallet => {
  return new ethers.Wallet(process.env.PRIVATE_KEY);
};

export { getSignerFromMnemonic, getSignerFromPrivateKey };
