// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import { LibGlobalStorage } from "./LibGlobalStorage.sol";
import { PermitTransferFrom, PermitBatchTransferFrom, SignatureTransferDetails, PermitSingle, PermitDetails, TokenPermissions, IPermit2 } from "../Interfaces/IPermit2.sol";

/// @title LibPermit
/// @notice This library contains helpers for using permit and permit2
library LibPermit {
    error InvalidPermit(string);

    string internal constant _DZAP_TRANSFER_WITNESS_TYPE_STRING =
        "DZapTransferWitness witness)DZapTransferWitness(address owner,address recipient)TokenPermissions(address token,uint256 amount)";
    bytes32 internal constant _DZAP_TRANSFER_WITNESS_TYPEHASH = keccak256("DZapTransferWitness(address owner,address recipient)");

    /// @notice Returns the permit2 address
    function permit2() private view returns (address) {
        return LibGlobalStorage.getPermit2();
    }

    /// @notice Handles eip2612 permit
    function eip2612Permit(address _owner, address _spender, address _token, uint256 _amount, bytes memory _data) internal {
        (uint256 deadline, uint8 v, bytes32 r, bytes32 s) = abi.decode(_data, (uint256, uint8, bytes32, bytes32));
        try IERC20Permit(_token).permit(_owner, _spender, _amount, deadline, v, r, s) {} catch Error(string memory reason) {
            if (IERC20(_token).allowance(_owner, _spender) < _amount) {
                revert InvalidPermit(reason);
            }
        }
    }

    /// @notice Handles permit2 approve and transfer
    function permit2ApproveAndTransfer(address _owner, address _spender, address _token, uint160 _amount, bytes memory data) internal {
        permit2Approve(_owner, _spender, _token, _amount, data);
        IPermit2(permit2()).transferFrom(_owner, _spender, uint160(_amount), _token);
    }

    /// @notice Handles permit2 approve
    function permit2Approve(address _owner, address _spender, address _token, uint160 _amount, bytes memory _data) internal {
        if (_data.length != 0) {
            IPermit2 permit2Contract = IPermit2(permit2());
            (uint48 nonce, uint48 expiration, uint256 sigDeadline, bytes memory signature) = abi.decode(_data, (uint48, uint48, uint256, bytes));

            try
                permit2Contract.permit(_owner, PermitSingle(PermitDetails(_token, _amount, expiration, nonce), _spender, sigDeadline), signature)
            {} catch Error(string memory reason) {
                (uint256 currentAllowance, uint256 allowanceExpiration, ) = permit2Contract.allowance(_owner, _token, _spender);
                if (currentAllowance < _amount || allowanceExpiration < block.timestamp) revert InvalidPermit(reason);
            }
        }
    }

    /// @notice Handles permit2 witness transfer from
    function permit2WitnessTransferFrom(address _owner, address _recipient, address _token, uint256 _amount, bytes memory _data) internal {
        (uint256 nonce, uint256 deadline, bytes memory _signature) = abi.decode(_data, (uint256, uint256, bytes));
        IPermit2(permit2()).permitWitnessTransferFrom(
            PermitTransferFrom({ permitted: TokenPermissions(_token, _amount), nonce: nonce, deadline: deadline }),
            SignatureTransferDetails(_recipient, _amount),
            _owner,
            createWitnessTransferFromHash(_owner, _recipient),
            _DZAP_TRANSFER_WITNESS_TYPE_STRING,
            _signature
        );
    }

    /// @notice Handles permit2 batch witness transfer from
    function permit2BatchWitnessTransferFrom(
        address _owner,
        address _recipient,
        PermitBatchTransferFrom calldata permit,
        bytes calldata _signature
    ) internal {
        uint256 length = permit.permitted.length;
        uint256 i;
        SignatureTransferDetails[] memory details = new SignatureTransferDetails[](length);

        for (i; i < length; ) {
            details[i] = SignatureTransferDetails(_recipient, permit.permitted[i].amount);
            unchecked {
                ++i;
            }
        }

        IPermit2(permit2()).permitWitnessTransferFrom(
            permit,
            details,
            _owner,
            createWitnessTransferFromHash(_owner, _recipient),
            _DZAP_TRANSFER_WITNESS_TYPE_STRING,
            _signature
        );
    }

    /// @notice Handles permit2 batch witness transfer from
    function permit2BatchWitnessTransferFrom(
        address _owner,
        address _recipient,
        bytes32 _witness,
        PermitBatchTransferFrom calldata permit,
        bytes calldata _signature,
        string memory _witnessTypeString
    ) internal {
        uint256 length = permit.permitted.length;
        uint256 i;
        SignatureTransferDetails[] memory details = new SignatureTransferDetails[](length);

        for (i; i < length; ) {
            details[i] = SignatureTransferDetails(_recipient, permit.permitted[i].amount);
            unchecked {
                ++i;
            }
        }

        IPermit2(permit2()).permitWitnessTransferFrom(permit, details, _owner, _witness, _witnessTypeString, _signature);
    }

    /* ========= PRIVATE ========= */

    function createWitnessTransferFromHash(address _owner, address _recipient) private pure returns (bytes32) {
        return keccak256(abi.encode(_DZAP_TRANSFER_WITNESS_TYPEHASH, _owner, _recipient));
    }
}
