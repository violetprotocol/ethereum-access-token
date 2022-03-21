import { JsonRpcSigner } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Wallet } from "ethers";
import { AuthToken, AuthMessageTypes } from "../messages/auth";
import { Domain } from "../messages/erc712";

// Returns a 65-byte signature composed of v, r, s components concatenated:
// https://docs.ethers.io/v5/api/utils/bytes/#signature-raw
const signAuthMessage = async (
  signer: Wallet | JsonRpcSigner | SignerWithAddress,
  domain: Domain,
  value: AuthToken,
): Promise<string> => {
  const signature = await signer._signTypedData(domain, AuthMessageTypes, value);
  return signature;
};

export default signAuthMessage;
