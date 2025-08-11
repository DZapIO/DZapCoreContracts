// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibGlobalStorage } from "./LibGlobalStorage.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

struct ValidatorStorage {
    mapping(address => uint256) nonce;
}

/// @title DZap LibValidator
/// @notice This library contains helpers for validating signatures
library LibValidator {
    error SigDeadlineExpired();
    error UnauthorizedSigner();

    bytes32 internal constant _VALIDATOR_NAMESPACE = keccak256("dzap.storage.library.validator");
    bytes32 private constant _DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)");

    bytes32 private constant _SIGNED_GASLESS_DATA_TYPEHASH =
        keccak256("SignedGasLessSwapData(bytes32 txId,address user,uint256 nonce,uint256 deadline,bytes32 executorFeesHash,bytes32 swapDataHash)");

    bytes32 private constant _SIGNED_GASLESS_BRIDGE_DATA_TYPEHASH =
        keccak256(
            "SignedGasLessBridgeData(bytes32 txId,address user,uint256 nonce,uint256 deadline,bytes32 executorFeesHash,bytes32 adapterDataHash)"
        );

    bytes32 private constant _SIGNED_GASLESS_SWAP_BRIDGE_DATA_TYPEHASH =
        keccak256(
            "SignedGasLessSwapBridgeData(bytes32 txId,address user,uint256 nonce,uint256 deadline,bytes32 executorFeesHash,bytes32 swapDataHash,bytes32 adapterDataHash)"
        );
    bytes32 private constant _SIGNED_FEE_DATA_TYPEHASH =
        keccak256("SignedFeeData(bytes32 txId,address user,uint256 nonce,uint256 deadline,bytes32 feeDataHash,bytes32 adapterDataHash)");
    string private constant _DOMAIN_NAME = "DZapVerifier";
    string private constant _VERSION = "1";
    bytes32 private constant _SALT = keccak256("DZap-v0.1");

    function validatorStorage() internal pure returns (ValidatorStorage storage ds) {
        bytes32 slot = _VALIDATOR_NAMESPACE;
        assembly {
            ds.slot := slot
        }
    }

    /// @notice Returns the nonce for a given user
    function getNonce(address _user) internal view returns (uint256) {
        return validatorStorage().nonce[_user];
    }

    /// @notice Handles gasless swap verification
    function handleGasLessSwapVerification(
        address _user,
        uint256 _deadline,
        bytes32 _transactionId,
        bytes32 _executorFeesHash,
        bytes32 _swapDataHash,
        bytes calldata _signature
    ) internal {
        if (_deadline < block.timestamp) revert SigDeadlineExpired();
        uint256 nonce = getNonce(_user);
        bytes32 msgHash = keccak256(
            abi.encode(_SIGNED_GASLESS_DATA_TYPEHASH, _transactionId, _user, nonce, _deadline, _executorFeesHash, _swapDataHash)
        );
        _verifySignature(_user, msgHash, _signature);
        _incrementNonce(_user);
    }

    /// @notice Handles gasless bridge verification
    function handleGasLessBridgeVerification(
        address _user,
        uint256 _deadline,
        bytes32 _transactionId,
        bytes32 _executorFeesHash,
        bytes32 _adapterDataHash,
        bytes calldata _signature
    ) internal {
        if (_deadline < block.timestamp) revert SigDeadlineExpired();
        uint256 nonce = getNonce(_user);
        bytes32 msgHash = keccak256(
            abi.encode(_SIGNED_GASLESS_BRIDGE_DATA_TYPEHASH, _transactionId, _user, nonce, _deadline, _executorFeesHash, _adapterDataHash)
        );
        _verifySignature(_user, msgHash, _signature);
        _incrementNonce(_user);
    }

    /// @notice Handles gasless swap bridge verification
    function handleGasLessSwapBridgeVerification(
        address _user,
        uint256 _deadline,
        bytes32 _transactionId,
        bytes32 _executorFeesHash,
        bytes32 _swapDataHash,
        bytes32 _adapterDataHash,
        bytes calldata _signature
    ) internal {
        if (_deadline < block.timestamp) revert SigDeadlineExpired();
        uint256 nonce = getNonce(_user);
        bytes32 msgHash = keccak256(
            abi.encode(
                _SIGNED_GASLESS_SWAP_BRIDGE_DATA_TYPEHASH,
                _transactionId,
                _user,
                nonce,
                _deadline,
                _executorFeesHash,
                _swapDataHash,
                _adapterDataHash
            )
        );
        _verifySignature(_user, msgHash, _signature);
        _incrementNonce(_user);
    }

    /// @notice Handles fee verification
    function handleFeeVerification(
        address _user,
        uint256 _deadline,
        bytes32 _transactionId,
        bytes32 _feeDataHash,
        bytes32 _adapterDataHash,
        bytes calldata _signature
    ) internal {
        if (_deadline < block.timestamp) revert SigDeadlineExpired();
        address validator = LibGlobalStorage.getFeeValidator();
        uint256 nonce = getNonce(_user);
        bytes32 msgHash = keccak256(abi.encode(_SIGNED_FEE_DATA_TYPEHASH, _transactionId, _user, nonce, _deadline, _feeDataHash, _adapterDataHash));
        _verifySignature(validator, msgHash, _signature);
        _incrementNonce(_user);
    }

    /* ========= PRIVATE ========= */

    function _getDomainSeparator() private view returns (bytes32) {
        return
            keccak256(abi.encode(_DOMAIN_TYPEHASH, keccak256(bytes(_DOMAIN_NAME)), keccak256(bytes(_VERSION)), block.chainid, address(this), _SALT));
    }

    function _verifySignature(address _signer, bytes32 _msgHash, bytes calldata _signature) private view {
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", _getDomainSeparator(), _msgHash));
        if (ECDSA.recover(digest, _signature) != _signer) revert UnauthorizedSigner();
    }

    function _incrementNonce(address _user) private {
        validatorStorage().nonce[_user]++;
    }
}
