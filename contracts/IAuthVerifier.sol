// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

struct EIP712Domain {
    string name;
    string version;
    uint256 chainId;
    address verifyingContract;
}

// struct FunctionParam {
//     string typ; // explicit full solidity atomic type of the parameter
//     bytes value; // the byte formatted parameter value
// }

struct FunctionCall {
    // string name; // name of the function being called
    bytes4 functionSignature;
    address target;
    address caller;
    bytes parameters;
    // FunctionParam[] parameters; // array of input parameters to the function call
}

struct AuthToken {
    uint256 expiry;
    FunctionCall functionCall;
}

interface IAuthVerifier {
    function verify(
        AuthToken memory token,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external view returns (bool);
}
