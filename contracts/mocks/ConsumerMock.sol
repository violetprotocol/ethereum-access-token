// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import "hardhat/console.sol";
import "../AccessTokenConsumer.sol";

contract ConsumerMock is AccessTokenConsumer {
    constructor(address verifier) AccessTokenConsumer(verifier) {}

    function noParams(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function singleAddress(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        address addr
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function singleUint256(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        uint256 num
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function singleStringCalldata(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata str
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function singleStringMemory(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string memory str
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function singleByte(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        bytes1 b1
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function singleBytesCalldata(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        bytes calldata b1
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function singleBytesMemory(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        bytes memory b1
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function doubleAddressUint(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        address addr,
        uint256 num
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function doubleUint256String(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        uint256 num,
        string memory str
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function doubleStringBytesCalldata(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata str,
        bytes calldata b
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function doubleStringBytesMemory(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata str,
        bytes calldata b
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function multipleStringBytesAddress(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata str,
        bytes calldata b,
        address addr
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function multipleStringBytesAddressUint256(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata str,
        bytes calldata b,
        address addr,
        uint256 num
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }

    function multipleStringBytesAddressUint256Bytes(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        string calldata str,
        bytes calldata b,
        address addr,
        uint256 num,
        bytes calldata b2
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }
}
