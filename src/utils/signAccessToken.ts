import { JsonRpcSigner } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Wallet } from "ethers";
import { AccessTokenTypes } from "../messages/accessToken";
import { Domain } from "../messages/erc712";
import { AccessTokenStruct } from "../types/IAccessTokenVerifier";

// Returns a 65-byte signature composed of v, r, s components concatenated:
// https://docs.ethers.io/v5/api/utils/bytes/#signature-raw
const signAccessToken = async (
  signer: Wallet | JsonRpcSigner | SignerWithAddress,
  domain: Domain,
  value: AccessTokenStruct,
): Promise<string> => {
  const signature = await signer._signTypedData(domain, AccessTokenTypes, value);
  return signature;
};

export { signAccessToken };
