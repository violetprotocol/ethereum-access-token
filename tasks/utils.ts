import { ethers } from "ethers";
import axios from "axios";

export function parse(data: any) {
  return ethers.utils.parseUnits(Math.ceil(data) + "", "gwei");
}

export async function calcGas(gasEstimated: any) {
  const gas = {
    gasLimit: gasEstimated, //.mul(110).div(100)
    maxFeePerGas: ethers.BigNumber.from(40000000000),
    maxPriorityFeePerGas: ethers.BigNumber.from(40000000000),
  };
  try {
    const { data } = await axios({
      method: "get",
      url: "https://gasstation-mainnet.matic.network/v2",
    });
    gas.maxFeePerGas = parse(data.fast.maxFee);
    gas.maxPriorityFeePerGas = parse(data.fast.maxPriorityFee);
  } catch (error) {
    console.error(error);
  }
  return gas;
}
