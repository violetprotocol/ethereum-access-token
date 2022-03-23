import { JsonRpcSigner } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { VoidSigner, Wallet, Signature } from "ethers";
import { Domain } from "../messages/erc712";
import { MailMessageTypes } from "../messages/mail";
import { EtherMail } from "../types/EtherMail";

// Returns a 65-byte signature composed of v, r, s components concatenated:
// https://docs.ethers.io/v5/api/utils/bytes/#signature-raw
const signMailMessage = async (
  signer: Wallet | JsonRpcSigner | SignerWithAddress,
  domain: Domain,
  value: EtherMail.MailStruct,
): Promise<string> => {
  const signature = await signer._signTypedData(domain, MailMessageTypes, value);
  return signature;
};

export { signMailMessage };
