import { JsonRpcSigner } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { VoidSigner, Wallet, Signature } from "ethers";
import { AuthMessageToken, AuthMessageTypes } from "../types/messages/auth";
import { Domain } from "../types/messages/erc712";

// Returns a 65-byte signature composed of v, r, s components concatenated:
// https://docs.ethers.io/v5/api/utils/bytes/#signature-raw
const signAuthMessage = async (
  signer: Wallet | VoidSigner | JsonRpcSigner | SignerWithAddress,
  domain: Domain,
  value: AuthMessageToken,
): Promise<string> => {
  const signature = await signer._signTypedData(domain, AuthMessageTypes, value);
  return signature;
};

export default signAuthMessage;
