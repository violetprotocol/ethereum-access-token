// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import { IAccessTokenVerifier, AccessToken, FunctionCall } from "./interfaces/IAccessTokenVerifier.sol";

// Calldata constants for AccessTokenVerifier.verify
// function verify (
//     AccessToken calldata token,
//     uint8 v,
//     bytes32 r,
//     bytes32 s
// )
uint256 constant Verify_functionSelector = 0xfda7127900000000000000000000000000000000000000000000000000000000;
uint256 constant Verify_token_head_offset = 0x04;
uint256 constant Verify_token_head_value = 0x80;
uint256 constant Verify_v_offset = 0x24;
uint256 constant Verify_r_offset = 0x44;
uint256 constant Verify_s_offset = 0x64;

// struct AccessToken {
//     uint256 expiry;
//     FunctionCall functionCall;
// }
uint256 constant Verify_expiry_offset = 0x84;
uint256 constant Verify_functionCall_head_offset = 0xa4;
uint256 constant Verify_functionCall_head_value = 0x40;

// struct FunctionCall {
//     bytes4 functionSignature;
//     address target;
//     address caller;
//     bytes parameters;
// }
uint256 constant Verify_functionSignature_offset = 0xc4;
uint256 constant Verify_target_offset = 0xe4;
uint256 constant Verify_caller_offset = 0x0104;
uint256 constant Verify_parameters_head_offset = 0x0124;
uint256 constant Verify_parameters_head_value = 0x80;
uint256 constant Verify_parameters_length_offset = 0x0144;
uint256 constant Verify_parameters_data_offset = 0x0164;

// Size of function selector and access token parameters - subtracted
// from calldatasize to get the length of the input parameters.
uint256 constant AccessTokenAndSelectorPrefixSize = 0x84;

// error AccessTokenUsed()
uint256 constant AccessTokenUsed_selector = 0xb8b24f64;

// error VerificationFailed();
uint256 constant VerificationFailed_selector = 0x439cc0cd;

library LibAccessTokenConsumer {
    /**
     * @dev Constructs an AccessToken from the current call context and verifies it
     *      with the provided verifier, then marks the access token as used.
     *
     *      Reverts with `AccessTokenUsed` if the access token is not unique.
     *      Reverts with `VerificationFailed` if the verifier does not validate the token.
     *
     *      note: This function assumes that the current call context had calldata beginning
     *      with `uint8 v, bytes32 r, bytes32 s, uint256 expiry`.
     */
    function consumeAccessToken(mapping(bytes32 => bool) storage _accessTokenUsed, address verifierAddress) internal {
        uint256 ptr;
        assembly {
            // Cache the free memory pointer to be used for calculating the access token slot
            // and the call to `AccessTokenVerifier.verify`.
            ptr := mload(0x40)

            // Copy (v, r, s, expiry) from calldata to memory at offset for verify calldata
            calldatacopy(add(ptr, Verify_v_offset), 0x04, 0x80)
        }
        // Solc (or maybe hardhat) loses its mind when you combine these blocks ¯\_(ツ)_/¯
        assembly {
            // Calculate the hash of the access token, equivalent to
            // `keccak256(abi.encodePacked(v, r, s, expiry))`
            let accessTokenHash := keccak256(add(add(ptr, Verify_v_offset), 31), 0x61)

            // Write the access token hash and the slot for `_accessTokenUsed` to memory
            // to calculate the slot for `_accessTokenUsed[accessTokenHash]`.
            // Mapping values are stored at keccak256(abi.encodePacked(key, slot))
            mstore(0, accessTokenHash)
            mstore(0x20, _accessTokenUsed.slot)
            let accessTokenSlot := keccak256(0, 0x40)

            // Revert if the access token is used. Equivalent to:
            // if (_accessTokenUsed[accessTokenHash]) {
            //      revert AccessTokenUsed();
            // }
            if sload(accessTokenSlot) {
                mstore(0, AccessTokenUsed_selector)
                revert(0x1c, 0x04)
            }

            // Write the function selector for `AccessTokenVerifier.verify`
            mstore(ptr, Verify_functionSelector)
            // Write the calldata offset for the `Token` struct
            mstore(add(ptr, Verify_token_head_offset), Verify_token_head_value)
            // Write the calldata offset for the `FunctionCall` struct
            mstore(add(ptr, Verify_functionCall_head_offset), Verify_functionCall_head_value)
            // Copy the function selector of the current call to `token.functionCall.functionSignature`
            calldatacopy(add(ptr, Verify_functionSignature_offset), 0x00, 0x04)
            // Write the target and caller addresses to the `FunctionCall` struct.
            mstore(add(ptr, Verify_target_offset), address())
            mstore(add(ptr, Verify_caller_offset), caller())

            // Write the calldata offset to the `FunctionCall.parameters` field
            mstore(add(ptr, Verify_parameters_head_offset), Verify_parameters_head_value)

            // Calculate the length of the function parameters of the current call, excluding
            // the function selector and access token.
            let parametersLength := sub(calldatasize(), AccessTokenAndSelectorPrefixSize)
            // Write `token.functionCall.parameters.length`
            mstore(add(ptr, Verify_parameters_length_offset), parametersLength)
            // Copy the function parameters of the current call to `token.functionCall.parameters`
            calldatacopy(add(ptr, Verify_parameters_data_offset), AccessTokenAndSelectorPrefixSize, parametersLength)

            // Calculate the size of the encoded calldata, which depends on the size of the input parameters
            let verifyCalldataSize := add(Verify_parameters_data_offset, parametersLength)

            // Call `AccessTokenVerifier.verify` with the encoded calldata and bubble up revert data
            // if the call fails.
            if iszero(staticcall(gas(), verifierAddress, ptr, verifyCalldataSize, 0, 0x20)) {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }

            // If the call returned invalid returndata (not 32 bytes) or something other
            // than a single non-zero word, revert with the `VerificationFailed` selector.
            // Equivalent to:
            // if (!verifier.verify(...)) {
            //      revert VerificationFailed();
            // }
            if iszero(
                and(
                    eq(returndatasize(), 0x20), // Ensure contract returns 32 bytes
                    mload(0) // Ensure contract returns value with last bit set
                )
            ) {
                mstore(0x00, VerificationFailed_selector)
                revert(0x1c, 0x04)
            }

            // Zero out all of the memory used for the calldata to avoid dirty bits in inheriting contract.
            calldatacopy(ptr, calldatasize(), verifyCalldataSize)

            // Mark the access token as used. Equivalent to:
            // `_accessTokenUsed[accessTokenHash] = true;`
            sstore(accessTokenSlot, 1)
        }
    }
}
