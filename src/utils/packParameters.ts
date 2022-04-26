import { hexlify } from "@ethersproject/bytes";
import { ethers } from "ethers";

const packParameters = (contractInterface: ethers.utils.Interface, functionName: string, params: any[]): string => {
  // detect function fragment
  const functionFragment = contractInterface.getFunction(functionName);

  // check is selected function fragment complies with auth compatible function format:
  // functionName(uint8 v, bytes32 r, bytes32 s, uint256 expiry, ...)
  if (!isAuthCompatible(functionFragment)) throw "packParameters: specified function is not AuthCompatible";

  // hexlify function encoding from index 4 onwards with parameters
  return hexlify(contractInterface._encodeParams(functionFragment.inputs.slice(4), params));
};

const isAuthCompatible = (functionFragment: ethers.utils.FunctionFragment): boolean => {
  if (functionFragment.inputs[0].name != "v" || functionFragment.inputs[0].type != "uint8") return false;
  if (functionFragment.inputs[1].name != "r" || functionFragment.inputs[1].type != "bytes32") return false;
  if (functionFragment.inputs[2].name != "s" || functionFragment.inputs[2].type != "bytes32") return false;
  if (functionFragment.inputs[3].name != "expiry" || functionFragment.inputs[3].type != "uint256") return false;
  return true;
};

export { packParameters };
