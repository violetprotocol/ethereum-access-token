// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import { AccessTokenConsumer } from "../AccessTokenConsumer.sol";

contract ConsumerMock is AccessTokenConsumer {
    // solhint-disable-next-line no-empty-blocks
    constructor(address verifier) AccessTokenConsumer(verifier) {}

    function noParams(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry
    ) public requiresAuth returns (bool) {
        return true;
    }

    function singleAddress(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        address
    ) public requiresAuth returns (bool) {
        return true;
    }

    function singleUint256(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        uint256
    ) public requiresAuth returns (bool) {
        return true;
    }

    function singleStringCalldata(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata
    ) public requiresAuth returns (bool) {
        return true;
    }

    function singleStringMemory(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string memory
    ) public requiresAuth returns (bool) {
        return true;
    }

    function singleByte(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        bytes1
    ) public requiresAuth returns (bool) {
        return true;
    }

    function singleBytesCalldata(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        bytes calldata
    ) public requiresAuth returns (bool) {
        return true;
    }

    function singleBytesMemory(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        bytes memory
    ) public requiresAuth returns (bool) {
        return true;
    }

    function doubleAddressUint(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        address,
        uint256
    ) public requiresAuth returns (bool) {
        return true;
    }

    function doubleUint256String(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        uint256,
        string memory
    ) public requiresAuth returns (bool) {
        return true;
    }

    function doubleStringBytesCalldata(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata,
        bytes calldata
    ) public requiresAuth returns (bool) {
        return true;
    }

    function doubleStringBytesMemory(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata,
        bytes calldata
    ) public requiresAuth returns (bool) {
        return true;
    }

    function multipleStringBytesAddress(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata,
        bytes calldata,
        address
    ) public requiresAuth returns (bool) {
        return true;
    }

    function multipleStringBytesAddressUint256(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata,
        bytes calldata,
        address,
        uint256
    ) public requiresAuth returns (bool) {
        return true;
    }

    function multipleStringBytesAddressUint256Bytes(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata,
        bytes calldata,
        address,
        uint256,
        bytes calldata
    ) public requiresAuth returns (bool) {
        return true;
    }
}
