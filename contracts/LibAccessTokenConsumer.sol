// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import { IAccessTokenVerifier, AccessToken, FunctionCall } from "./interfaces/IAccessTokenVerifier.sol";

uint256 constant Verify_functionSelector = 0xfda7127900000000000000000000000000000000000000000000000000000000;

uint256 constant Verify_token_head_offset = 0x04;
uint256 constant Verify_token_head_value = 0x80;
uint256 constant Verify_v_offset = 0x24;
uint256 constant Verify_r_offset = 0x44;
uint256 constant Verify_s_offset = 0x64;
uint256 constant Verify_expiry_offset = 0x84;
uint256 constant Verify_functionCall_head_offset = 0xa4;
uint256 constant Verify_functionCall_head_value = 0x40;
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

uint256 constant AccessTokenUsed_selector = 0xb8b24f64;
uint256 constant VerificationFailed_selector = 0x439cc0cd;

library LibAccessTokenConsumer {
    function consumeAccessToken(mapping(bytes32 => bool) storage _accessTokenUsed, address verifierAddress) internal {
        uint256 ptr;
        assembly {
            ptr := mload(0x40)
            calldatacopy(add(ptr, Verify_v_offset), 0x04, 0x80)
        }
        // Solc (or maybe hardhat) loses its mind when you combine these blocks ¯\_(ツ)_/¯
        assembly {
            let accessTokenHash := keccak256(add(add(ptr, Verify_v_offset), 31), 0x61)
            mstore(0, accessTokenHash)
            mstore(0x20, _accessTokenUsed.slot)
            let accessTokenSlot := keccak256(0, 0x40)
            if sload(accessTokenSlot) {
                mstore(0, AccessTokenUsed_selector)
                revert(0x1c, 0x04)
            }
            mstore(ptr, Verify_functionSelector)
            mstore(add(ptr, Verify_token_head_offset), Verify_token_head_value)
            mstore(add(ptr, Verify_functionCall_head_offset), Verify_functionCall_head_value)
            calldatacopy(add(ptr, Verify_functionSignature_offset), 0x00, 0x04)
            mstore(add(ptr, Verify_target_offset), address())
            mstore(add(ptr, Verify_caller_offset), caller())
            mstore(add(ptr, Verify_parameters_head_offset), Verify_parameters_head_value)

            let parametersLength := sub(calldatasize(), AccessTokenAndSelectorPrefixSize)
            mstore(add(ptr, Verify_parameters_length_offset), parametersLength)

            calldatacopy(add(ptr, Verify_parameters_data_offset), AccessTokenAndSelectorPrefixSize, parametersLength)

            let verifyCalldataSize := add(Verify_parameters_data_offset, parametersLength)

            if iszero(staticcall(gas(), verifierAddress, ptr, verifyCalldataSize, 0, 0x20)) {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
            if iszero(
                and(
                    eq(returndatasize(), 0x20), // Ensure contract returns 32 bytes
                    mload(0) // Ensure contract returns value with last bit set
                )
            ) {
                mstore(0x00, VerificationFailed_selector)
                revert(0x1c, 0x04)
            }
            calldatacopy(ptr, calldatasize(), verifyCalldataSize)
            sstore(accessTokenSlot, 1)
        }
    }
}
