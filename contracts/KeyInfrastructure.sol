//SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

/**
 * @title KeyInfrastructure
 * @dev Contract to manage keys using a 3-tiered key relationship.
 * Each tier specifies a role that can only be managed by the tier above it.
 * In order from 'coldest' to 'hottest' keys, these roles are:
 * - Root key
 * - Intermediate key
 * - Active Issuer(s)
 */
contract KeyInfrastructure {
    address internal immutable _root;
    address internal _intermediate;
    address[] internal _activeIssuers;
    mapping(address => bool) internal _isActiveIssuer;

    event IntermediateRotated(address newKey);
    event IssuerActivated(address activatedIssuer);
    event IssuerDeactivated(address deactivatedIssuer);

    modifier onlyRoot() {
        // MBR -> Must be root
        require(msg.sender == _root, "unauthorised: MBR");
        _;
    }

    modifier onlyIntermediate() {
        // MBI -> Must be intermediate
        require(msg.sender == _intermediate, "unauthorised: MBI");
        _;
    }

    constructor(address root) {
        _root = root;
    }

    /**
     * @dev Rotates the Intermediate key.
     * Only callable by the Root key.
     */
    function rotateIntermediate(address newIntermediate) public onlyRoot {
        _intermediate = newIntermediate;
        emit IntermediateRotated(newIntermediate);
    }

    /**
     * @dev Adds addresses to the list of Active Issuers.
     * Only callable by the Intermediate key.
     */
    function activateIssuers(address[] calldata newIssuers) public onlyIntermediate {
        for (uint256 i = 0; i < newIssuers.length; i++) {
            address newKey = newIssuers[i];
            if (!_isActiveIssuer[newKey]) {
                _addToActiveIssuers(newKey);
                emit IssuerActivated(newKey);
            }
        }
    }

     /**
     * @dev Remove `issuers` from the list of Active Issuers.
     * Only callable by the Intermediate key.
     */
    function deactivateIssuers(address[] calldata issuers) public onlyIntermediate {
        for (uint256 i = 0; i < issuers.length; i++) {
            address oldKey = issuers[i];
            if (_isActiveIssuer[oldKey]) {
                _removeFromActiveIssuers(oldKey);
                emit IssuerDeactivated(oldKey);
            }
        }
    }

    /**
     * @dev Returns the Root key.
     */
    function getRootKey() public view returns (address) {
        return _root;
    }

    /**
     * @dev Returns the Intermediate key.
     */
    function getIntermediateKey() public view returns (address) {
        return _intermediate;
    }

    /**
     * @dev Returns the list of Active Issuers.
     */
    function getActiveIssuers() public view returns (address[] memory) {
        return _activeIssuers;
    }

    /**
     * @dev Returns whether a given address is registered as Active Issuer.
     */
    function isActiveIssuer(address addr) public view returns (bool) {
        return _isActiveIssuer[addr];
    }

    function _addToActiveIssuers(address addr) internal {
        _isActiveIssuer[addr] = true;
        _activeIssuers.push(addr);
    }

    function _removeFromActiveIssuers(address addr) internal {
        _isActiveIssuer[addr] = false;

        for (uint256 i = 0; i < _activeIssuers.length; i++) {
            address issuer = _activeIssuers[i];
            if (addr == issuer) {
                _activeIssuers[i] = _activeIssuers[_activeIssuers.length - 1];
                _activeIssuers.pop();
                break;
            }
        }
    }
}
