interface AuthMessageToken {
  expiry: number;
  functionCall: FunctionCall;
}

interface FunctionCall {
  name: string;
  target: string;
  caller: string;
  parameters: FunctionParam[];
}

interface FunctionParam {
  typ: string;
  value: string; // hexadecimal string representing a byte array
}

// The named list of all type definitions
const AuthMessageTypes = {
  FunctionParam: [
    { name: "typ", type: "string" },
    { name: "value", type: "bytes" },
  ],
  FunctionCall: [
    { name: "name", type: "string" },
    { name: "target", type: "address" },
    { name: "caller", type: "address" },
    { name: "parameters", type: "FunctionParam[]" },
  ],
  Token: [
    { name: "expiry", type: "uint256" },
    { name: "functionCall", type: "FunctionCall" },
  ],
};

export { AuthMessageToken, FunctionCall, FunctionParam, AuthMessageTypes };
