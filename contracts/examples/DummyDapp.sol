// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import "hardhat/console.sol";
import "../AccessTokenConsumer.sol";

contract DummyDapp is AccessTokenConsumer {
    constructor(address verifier) AccessTokenConsumer(verifier) {}

    function lend(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        address token,
        uint256 amount
    ) public view requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }
}
