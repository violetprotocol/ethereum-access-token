// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "hardhat/console.sol";
import "./IAuthVerifier.sol";

contract AuthCompatible {
    // SENSITIVE VALUE
    // CHANGING THIS WILL BREAK IMPLEMENTATION UNLESS YOU KNOW WHAT YOU ARE DOING
    // Expected position of the proof bytes array in the calldata
    uint256 private constant MSG_DATA_SIG_POSITION = 0x00;

    IAuthVerifier private _verifier;

    constructor(address authVerifier) {
        _verifier = IAuthVerifier(authVerifier);
    }

    modifier requiresAuth() {
        require(verify(), "Auth: token verification failure");
        _;
    }

    function verify() internal view returns (bool) {
        Token memory token = constructToken();
        bytes memory sig = extractSignature();

        return _verifier.verify(token, sig);
    }

    function constructToken() internal view returns (Token memory token) {
        FunctionCall memory functionCall;
        functionCall.functionSignature = msg.sig;
        functionCall.target = address(this);
        functionCall.caller = msg.sender;

        functionCall.parameters = extractInputs();
        token.functionCall = functionCall;
        token.expiry = extractExpiry();
    }

    // Takes calldata and extracts non-signature, non-expiry function inputs as a byte array
    // Removes all references to the proof object except any offsets related to
    // other inputs that are pushed by the proof
    function extractInputs() public pure returns (bytes memory inputs) {
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            mstore(0x40, add(ptr, calldatasize()))

            let startPos := 0x04
            let initialSigPos := add(startPos, MSG_DATA_SIG_POSITION)

            // Relative position of sig byte array as an offset
            let sigOffset := mload(add(ptr, initialSigPos))

            // Absolute position of sig byte array
            let sigPosition := add(startPos, sigOffset)

            // Sig length as extracted from first 32-byte block
            let sigLen := mload(add(ptr, sigPosition))
            let diff := sub(0x20, mod(sigLen, 0x20)) // Pad to integer number of 32-bytes

            // add 32-bytes to include sig len-descriptor prefix
            let totalSigLength := add(add(sigLen, diff), 0x20)

            let headValueSize := sub(sub(sub(sigPosition, initialSigPos), 0x20), 0x20) // space between sig offset pointer and the start of sig bytes
            let tailValueSize := sub(calldatasize(), add(sigPosition, totalSigLength)) // space between end of sig bytes and end of calldata
            let totalInputSize := add(headValueSize, tailValueSize)

            // Store expected length of total byte array as first value
            mstore(inputs, totalInputSize)

            // Copy from the first value ignoring sig offset value and expiry up until the beginning to the sig byte array
            calldatacopy(add(inputs, 0x20), add(initialSigPos, 0x40), headValueSize)

            // Copy from the end of the sig byte array up until the end of the calldata array
            calldatacopy(add(add(inputs, 0x20), headValueSize), add(sigPosition, totalSigLength), tailValueSize)
        }
    }

    // Takes calldata and extracts the signature as a byte array
    // Removes all references to anything other than the signature
    function extractSignature() public pure returns (bytes memory sig) {
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            mstore(0x40, add(ptr, calldatasize()))

            let startPos := 0x04
            let initialSigPos := add(startPos, MSG_DATA_SIG_POSITION)

            // Relative position of sig byte array as an offset
            let sigOffset := mload(add(ptr, initialSigPos))

            // Absolute position of sig byte array
            let sigPosition := add(startPos, sigOffset)

            // Sig length as extracted from first 32-byte block
            let sigLen := mload(add(ptr, sigPosition))
            let diff := sub(0x20, mod(sigLen, 0x20)) // Pad to integer number of 32-bytes

            // add 32-bytes to include sig len-descriptor prefix
            let totalSigLength := add(add(sigLen, diff), 0x20)

            // disgusting dirty putrid abomination of a detestable drivelous hack
            // because for some reason byte array pointers are being assigned the same address as another causing overwrite
            sig := add(sig, ptr)
            mstore(0x40, add(ptr, add(calldatasize(), totalSigLength)))

            // Copy from the first value ignoring sig offset value up until the beginning to the sig byte array
            calldatacopy(sig, sigPosition, totalSigLength)
        }
    }

    // Takes calldata and extracts the expiry as an uint256
    // Removes all references to anything other than the expiry
    function extractExpiry() public pure returns (uint256 expiry) {
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            mstore(0x40, add(ptr, calldatasize()))

            let startPos := 0x04
            let initialSigPos := add(startPos, add(MSG_DATA_SIG_POSITION, 0x20))

            expiry := mload(add(ptr, initialSigPos))
        }
    }
}
