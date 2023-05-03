//SPDX-License-Identifier: MIT
pragma solidity ~0.7.6;

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

    function rotateIntermediate(address newIntermediate) public onlyRoot {
        _intermediate = newIntermediate;
        emit IntermediateRotated(newIntermediate);
    }

    function activateIssuers(address[] calldata newIssuers) public onlyIntermediate {
        for (uint256 i = 0; i < newIssuers.length; i++) {
            address newKey = newIssuers[i];
            if (!_isActiveIssuer[newKey]) {
                _addToActiveIssuers(newKey);
                emit IssuerActivated(newKey);
            }
        }
    }

    function deactivateIssuers(address[] calldata issuers) public onlyIntermediate {
        for (uint256 i = 0; i < issuers.length; i++) {
            address oldKey = issuers[i];
            if (_isActiveIssuer[oldKey]) {
                _removeFromActiveIssuers(oldKey);
                emit IssuerDeactivated(oldKey);
            }
        }
    }

    function getRootKey() public view returns (address) {
        return _root;
    }

    function getIntermediateKey() public view returns (address) {
        return _intermediate;
    }

    function getActiveIssuers() public view returns (address[] memory) {
        return _activeIssuers;
    }

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
