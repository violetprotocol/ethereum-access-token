import { JsonRpcSigner } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Wallet } from "ethers";
import { AuthMessageTypes } from "../messages/auth";
import { Domain } from "../messages/erc712";
import { AuthTokenStruct } from "../types/AuthVerifier";

// Returns a 65-byte signature composed of v, r, s components concatenated:
// https://docs.ethers.io/v5/api/utils/bytes/#signature-raw
const signAuthMessage = async (
  signer: Wallet | JsonRpcSigner | SignerWithAddress,
  domain: Domain,
  value: AuthTokenStruct,
): Promise<string> => {
  const signature = await signer._signTypedData(domain, AuthMessageTypes, value);
  return signature;
};

export { signAuthMessage };
