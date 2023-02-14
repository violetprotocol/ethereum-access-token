//SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

contract KeyInfrastructure {
    address internal _root;
    address internal _intermediate;
    address[] internal _issuers;
    mapping(address => bool) internal _isActiveIssuer;

    event IntermediateRotated(address newKey);
    event IssuerActivated(address activatedIssuer);
    event IssuerDeactivated(address deactivatedIssuer);

    modifier onlyRoot() {
        require(msg.sender == _root, "unauthorised: must be root");
        _;
    }

    modifier onlyIntermediate() {
        require(msg.sender == _intermediate, "unauthorised: must be intermediate");
        _;
    }

    modifier onlyIssuer() {
        require(_isActiveIssuer[msg.sender], "not a valid issuer");
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
                addToIssuers(newKey);
                emit IssuerActivated(newKey);
            }
        }
    }

    function deactivateIssuers(address[] calldata issuers) public onlyIntermediate {
        for (uint256 i = 0; i < issuers.length; i++) {
            address oldKey = issuers[i];
            if (_isActiveIssuer[oldKey]) {
                removeFromIssuers(oldKey);
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
        return _issuers;
    }

    function isActiveIssuer(address addr) public view returns (bool) {
        return _isActiveIssuer[addr];
    }

    function addToIssuers(address addr) internal {
        _isActiveIssuer[addr] = true;
        _issuers.push(addr);
    }

    function removeFromIssuers(address addr) internal {
        _isActiveIssuer[addr] = false;

        for (uint256 i = 0; i < _issuers.length; i++) {
            address issuer = _issuers[i];
            if (addr == issuer) {
                _issuers[i] = _issuers[_issuers.length - 1];
                _issuers.pop();
                break;
            }
        }
    }
}
