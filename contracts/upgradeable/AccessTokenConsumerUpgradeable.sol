// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { IAccessTokenVerifier } from "../interfaces/IAccessTokenVerifier.sol";
import { LibAccessTokenConsumer } from "../LibAccessTokenConsumer.sol";

/**
 * @title AccessTokenConsumerUpgradeable
 * @dev Implementation of `AccessTokenConsumer`, for consuming Ethereum Access Tokens (EIP-7272),
 * compatible with OpenZeppelin UUPS upgradeable contracts.
 * @dev The AccessTokenConsumer contract is inherited by contracts that need to gate functions
 * using Ethereum Access Tokens (EIP-7272).
 * It provides the `requiresAuth` modifier which reverts unless a valid EAT is passed along with the function call.
 * This contract stores and points to an AccessTokenVerifier contract which is called to verify
 * an EAT after reconstructing it from a function call.
 * Finally, it keeps track of consumed EATs to prevent re-use.
 */
contract AccessTokenConsumerUpgradeable is Initializable {
    // Address of the AccessTokenVerifier currently used by this contract
    IAccessTokenVerifier public verifier;
    // Stores whether an EAT has already been used
    mapping(bytes32 => bool) private _accessTokenUsed;

    error VerificationFailed();
    error AccessTokenUsed();

    /**
     * @dev Initializes the AcessTokenConsumer by setting the AccessTokenVerifier address.
     * This must be called in the initializer function of contracts inheriting AccessTokenConsumer.
     */
    function __AccessTokenConsumer_init(address accessTokenVerifier) internal onlyInitializing {
        if (verifier == IAccessTokenVerifier(address(0))) {
            verifier = IAccessTokenVerifier(accessTokenVerifier);
        }
    }

    /**
     * @dev Adds a layer of access control to a function
     * by requiring a valid EAT to be provided.
     * If valid, it marks the EAT as consumed.
     */
    modifier requiresAuth() {
        LibAccessTokenConsumer.consumeAccessToken(_accessTokenUsed, address(verifier));
        _;
    }

    /**
     * @dev Updates the AccessTokenVerifier address this contract is pointing to.
     */
    function setVerifier(address newVerifier) internal {
        verifier = IAccessTokenVerifier(newVerifier);
    }
}
