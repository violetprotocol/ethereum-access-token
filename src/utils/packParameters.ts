import { hexlify } from "@ethersproject/bytes";
import { ethers } from "ethers";

const placeholderV = 27;
const placeholderR = "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3";
const placeholderS = "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3";
const placeholderExpiry = 1652875695;

const packParameters = (
  contractInterface: ethers.utils.Interface,
  functionNameOrSelector: string,
  params: any[],
): string => {
  // detect function fragment
  const functionFragment = contractInterface.getFunction(functionNameOrSelector);

  // check if selected function fragment complies with auth compatible function format:
  // functionName(uint8 v, bytes32 r, bytes32 s, uint256 expiry, ...)
  if (!isAccessTokenCompatible(functionFragment))
    throw "packParameters: specified function is not compatible with AccessTokenConsumer";

  // hexlify function encoding from index 4 onwards with parameters
  return `0x${hexlify(
    contractInterface._encodeParams(functionFragment.inputs, [
      placeholderV,
      placeholderR,
      placeholderS,
      placeholderExpiry,
      ...params,
    ]),
  )
    .slice(2) // remove 0x
    .slice(64) // remove v
    .slice(64) // remove r
    .slice(64) // remove s
    .slice(64)}`; // remove expiry
};

const isAccessTokenCompatible = (functionFragment: ethers.utils.FunctionFragment): boolean => {
  if (functionFragment.inputs[0].name != "v" || functionFragment.inputs[0].type != "uint8") return false;
  if (functionFragment.inputs[1].name != "r" || functionFragment.inputs[1].type != "bytes32") return false;
  if (functionFragment.inputs[2].name != "s" || functionFragment.inputs[2].type != "bytes32") return false;
  if (functionFragment.inputs[3].name != "expiry" || functionFragment.inputs[3].type != "uint256") return false;
  return true;
};

export { packParameters };
