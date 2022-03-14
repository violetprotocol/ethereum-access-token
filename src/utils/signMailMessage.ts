import { JsonRpcSigner } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { VoidSigner, Wallet, Signature } from "ethers";
import { Domain } from "../messages/erc712";
import { Mail, MailMessageTypes } from "../messages/mail";

// Returns a 65-byte signature composed of v, r, s components concatenated:
// https://docs.ethers.io/v5/api/utils/bytes/#signature-raw
const signMailMessage = async (
  signer: Wallet | JsonRpcSigner | SignerWithAddress,
  domain: Domain,
  value: Mail,
): Promise<string> => {
  const signature = await signer._signTypedData(domain, MailMessageTypes, value);
  return signature;
};

export default signMailMessage;
