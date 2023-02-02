// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import "hardhat/console.sol";
import "../AccessTokenConsumer.sol";

contract DummyDapp is AccessTokenConsumer {
    // solhint-disable-next-line no-empty-blocks
    constructor(address verifier) AccessTokenConsumer(verifier) {}

    function lend(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        address,
        uint256
    ) public requiresAuth(v, r, s, expiry) returns (bool) {
        return true;
    }
}
