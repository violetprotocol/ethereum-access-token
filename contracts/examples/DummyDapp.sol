// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import { AccessTokenConsumer } from "../AccessTokenConsumer.sol";

contract DummyDapp is AccessTokenConsumer {
    address private _owner;

    // solhint-disable-next-line no-empty-blocks
    constructor(address verifier) AccessTokenConsumer(verifier) {
        _owner = msg.sender;
    }

    function updateVerifier(address newVerifier) external {
        require(msg.sender == _owner);
        setVerifier(newVerifier);
    }

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
