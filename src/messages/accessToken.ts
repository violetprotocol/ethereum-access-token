import { BigNumberish } from "ethers";

// The named list of all type definitions
const AuthMessageTypes = {
  FunctionCall: [
    { name: "functionSignature", type: "bytes4" },
    { name: "target", type: "address" },
    { name: "caller", type: "address" },
    { name: "parameters", type: "bytes" },
  ],
  AccessToken: [
    { name: "expiry", type: "uint256" },
    { name: "functionCall", type: "FunctionCall" },
  ],
};

export { AuthMessageTypes };
