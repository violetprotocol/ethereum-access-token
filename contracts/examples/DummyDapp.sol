// SPDX-License-Identifier: MIT
pragma solidity ~0.7.6;

import "../AccessTokenConsumer.sol";

contract DummyDapp is AccessTokenConsumer {
    address private _owner;

    constructor(address verifier) AccessTokenConsumer(verifier) {
        _owner = msg.sender;
    }

    function updateVerifier(address newVerifier) external {
        require(msg.sender == _owner, "Unauthorized");
        super.setVerifier(newVerifier);
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
