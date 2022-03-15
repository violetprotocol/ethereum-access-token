// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "hardhat/console.sol";
import "./AuthCompatible.sol";

contract DummyDapp is AuthCompatible {
    constructor(address verifier) AuthCompatible(verifier) {}

    function lend(
        bytes memory sig,
        uint256 expiry,
        address token,
        uint256 amount
    ) public view requiresAuth returns (bool) {
        return true;
    }
}
