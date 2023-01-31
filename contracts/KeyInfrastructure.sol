//SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

contract KeyInfrastructure {
    address internal _root;
    address internal _intermediate;
    address[] internal _issuers;
    mapping(address => bool) internal _isIssuer;

    event IntermediateRotated(address newKey);
    event IssuersActivated(address[] newIssuers);
    event IssuersDeactivated(address[] oldIssuers);

    modifier onlyRoot() {
        require(msg.sender == _root, "unauthorised: must be root");
        _;
    }

    modifier onlyIntermediate() {
        require(msg.sender == _intermediate, "unauthorised: must be intermediate");
        _;
    }

    modifier onlyIssuer() {
        require(_isIssuer[msg.sender], "not valid signer");
        _;
    }

    constructor(address root) {
        _root = root;
    }

    function rotateIntermediate(address newIntermediate) public onlyRoot {
        _intermediate = newIntermediate;
        emit IntermediateRotated(newIntermediate);
    }

    function activateIssuers(address[] calldata newKeys) public onlyIntermediate {
        for (uint256 i = 0; i < newKeys.length; i++) {
            address newKey = newKeys[i];
            if (!_isIssuer[newKey]) addToIssuers(newKey);
        }

        emit IssuersActivated(newKeys);
    }

    function deactivateIssuers(address[] calldata keys) public onlyIntermediate {
        for (uint256 i = 0; i < keys.length; i++) {
            address oldKey = keys[i];
            if (_isIssuer[oldKey]) removeFromIssuers(oldKey);
        }

        emit IssuersDeactivated(keys);
    }

    function getRootKey() public view returns (address) {
        return _root;
    }

    function getIntermediateKey() public view returns (address) {
        return _intermediate;
    }

    function getIssuerKeys() public view returns (address[] memory) {
        return _issuers;
    }

    function checkIsIssuer(address key) public view returns (bool) {
        return _isIssuer[key];
    }

    function addToIssuers(address key) internal {
        _isIssuer[key] = true;
        _issuers.push(key);
    }

    function removeFromIssuers(address key) internal {
        _isIssuer[key] = false;

        for (uint256 i = 0; i < _issuers.length; i++) {
            address issuer = _issuers[i];
            if (key == issuer) {
                _issuers[i] = _issuers[_issuers.length - 1];
                _issuers.pop();
                break;
            }
        }
    }
}
