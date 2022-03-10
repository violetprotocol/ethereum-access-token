// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "hardhat/console.sol";
import "./KeyInfrastructure.sol";

contract Auth is KeyInfrastructure {
    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    struct FunctionParam {
        string typ; // explicit full solidity atomic type of the parameter
        bytes value; // the byte formatted parameter value
    }

    struct FunctionCall {
        string name; // name of the function being called
        address target;
        address caller;
        FunctionParam[] parameters; // array of input parameters to the function call
    }

    struct Token {
        uint256 expiry;
        FunctionCall functionCall;
    }

    bytes32 private constant EIP712DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    bytes32 private constant FUNCTIONPARAM_TYPEHASH = keccak256("FunctionParam(string typ,bytes value)");

    // solhint-disable max-line-length
    bytes32 private constant FUNCTIONCALL_TYPEHASH =
        keccak256("FunctionCall(string name,address target,address caller,FunctionParam[] parameters)");

    bytes32 private constant TOKEN_TYPEHASH = keccak256("Token(uint256 expiry,FunctionCall functionCall)");

    // solhint-disable var-name-mixedcase
    bytes32 public DOMAIN_SEPARATOR;

    constructor(address root) KeyInfrastructure(root) {
        DOMAIN_SEPARATOR = hash(
            EIP712Domain({
                name: "Ethereum Authorization Token",
                version: "1",
                chainId: block.chainid,
                verifyingContract: address(this)
            })
        );
    }

    function hash(EIP712Domain memory eip712Domain) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    EIP712DOMAIN_TYPEHASH,
                    keccak256(bytes(eip712Domain.name)),
                    keccak256(bytes(eip712Domain.version)),
                    eip712Domain.chainId,
                    eip712Domain.verifyingContract
                )
            );
    }

    function hash(FunctionParam memory param) internal pure returns (bytes32) {
        return keccak256(abi.encode(FUNCTIONPARAM_TYPEHASH, keccak256(bytes(param.typ)), keccak256(param.value)));
    }

    function hash(FunctionParam[] memory params) internal pure returns (bytes32) {
        bytes memory res;
        for (uint256 i = 0; i < params.length; i++) {
            res = bytes.concat(res, abi.encodePacked(hash(params[i])));
        }

        return keccak256(res);
    }

    function hash(FunctionCall memory call) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    FUNCTIONCALL_TYPEHASH,
                    keccak256(bytes(call.name)),
                    call.target,
                    call.caller,
                    hash(call.parameters)
                )
            );
    }

    function hash(Token memory token) internal pure returns (bytes32) {
        return keccak256(abi.encode(TOKEN_TYPEHASH, token.expiry, hash(token.functionCall)));
    }

    function verify(
        Token memory token,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, hash(token)));
        return ecrecover(digest, v, r, s) == _issuer;
    }
}
