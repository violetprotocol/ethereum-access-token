// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { AccessTokenConsumerUpgradeable } from "../AccessTokenConsumerUpgradeable.sol";

contract DummyDappUpgradeable is Initializable, OwnableUpgradeable, UUPSUpgradeable, AccessTokenConsumerUpgradeable {
    function initialize(address _EATVerifier) public initializer {
        __Ownable_init();
        __AccessTokenConsumer_init(_EATVerifier);
    }

    function updateVerifier(address newVerifier) external onlyOwner {
        setVerifier(newVerifier);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

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
