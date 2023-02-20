import { Signature, splitSignature } from "@ethersproject/bytes";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ethers } from "ethers";
import { packParameters, signAccessToken } from "../../src/utils";

export interface RawEthereumAccessToken {
  expiry: BigNumber;
  functionCall: {
    functionSignature: string;
    target: string;
    caller: string;
    parameters: string;
  };
}

export interface SignedEthereumAccessToken {
  signature: Signature;
  token: RawEthereumAccessToken;
}

export const generateEAT = async (
  signer: SignerWithAddress,
  domain: any,
  contractInterface: ethers.utils.Interface,
  functionName: string,
  target: string,
  caller: string,
  parameters: any[],
  expiry: BigNumber,
): Promise<SignedEthereumAccessToken> => {
  const token = {
    expiry,
    functionCall: {
      functionSignature: contractInterface.getSighash(functionName),
      target,
      caller,
      parameters: packParameters(contractInterface, functionName, parameters),
    },
  };
  const signature = splitSignature(await signAccessToken(signer, domain, token));

  return {
    token,
    signature,
  };
};
