// SPDX-License-Identifier: MIT
pragma abicoder v2;
pragma solidity ~0.7.6;

import "./IAccessTokenVerifier.sol";
import "./KeyInfrastructure.sol";

contract AccessTokenVerifier is IAccessTokenVerifier, KeyInfrastructure {
    bytes32 private constant EIP712DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    // solhint-disable max-line-length
    bytes32 private constant FUNCTIONCALL_TYPEHASH =
        keccak256("FunctionCall(bytes4 functionSignature,address target,address caller,bytes parameters)");

    // solhint-disable max-line-length
    bytes32 private constant TOKEN_TYPEHASH =
        keccak256(
            "AccessToken(uint256 expiry,FunctionCall functionCall)FunctionCall(bytes4 functionSignature,address target,address caller,bytes parameters)"
        );

    // Cache the domain separator as an immutable value, but also store the chain id that it corresponds to, in order to
    // invalidate the cached domain separator if the chain id changes.
    bytes32 private immutable _cachedDomainSeparator;
    uint256 private immutable _cachedChainId;
    address private immutable _cachedThis;

    constructor(address root) KeyInfrastructure(root) {
        uint256 chainId;
        // solhint-disable no-inline-assembly
        assembly {
            chainId := chainid()
        }
        _cachedChainId = chainId;
        _cachedDomainSeparator = _buildDomainSeparator(chainId);
        _cachedThis = address(this);
    }

    function hash(EIP712Domain memory eip712Domain) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    EIP712DOMAIN_TYPEHASH,
                    keccak256(bytes(eip712Domain.name)),
                    keccak256(bytes(eip712Domain.version)),
                    eip712Domain.chainId,
                    eip712Domain.verifyingContract
                )
            );
    }

    function hash(FunctionCall calldata call) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    FUNCTIONCALL_TYPEHASH,
                    call.functionSignature,
                    call.target,
                    call.caller,
                    keccak256(call.parameters)
                )
            );
    }

    function hash(AccessToken calldata token) internal pure returns (bytes32) {
        return keccak256(abi.encode(TOKEN_TYPEHASH, token.expiry, hash(token.functionCall)));
    }

    function verify(
        AccessToken calldata token,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view override returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", _domainSeparator(), hash(token)));

        // HE -> Has Expired
        require(token.expiry > block.timestamp, "AccessToken: HE");

        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            // ISS -> Invalid Signature S
            revert("AccessToken: ISS");
        }

        if (v != 27 && v != 28) {
            // ISV -> Invalid Signature V
            revert("AccessToken: ISV");
        }

        // If the signature is valid (and not malleable), return the signer address
        address signer = ecrecover(digest, v, r, s);
        if (signer == address(0)) {
            // IS -> Invalid Signature
            revert("AccessToken: IS");
        }

        return _isActiveIssuer[signer];
    }    
    
    function _domainSeparator() internal view returns (bytes32) {
        uint256 chainId;
        // solhint-disable no-inline-assembly
        assembly {
            chainId := chainid()
        }
        if (address(this) == _cachedThis && chainId == _cachedChainId) {
            return _cachedDomainSeparator;
        } else {
            return _buildDomainSeparator(chainId);
        }
    }

    function _buildDomainSeparator(uint256 chainId) private view returns (bytes32) {
        return
            hash(
                EIP712Domain({
                    name: "Ethereum Access Token",
                    version: "1",
                    chainId: chainId,
                    verifyingContract: address(this)
                })
            );
    }
}
