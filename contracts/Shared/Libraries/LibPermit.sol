// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "../Interfaces/IDAIPermit.sol";
import "../Interfaces/IPermit2.sol";

struct PermitStorage {
    address permit2;
    bool initialized;
}

/// @title LibPermit
/// @notice This library contains helpers for using permit and permit2
library LibPermit {
    error InvalidPermitData();
    error InvalidPermit();

    bytes32 internal constant _PERMIT_STORAGE_SLOT =
        keccak256("dzap.storage.library.permit");

    function permitStorage() internal pure returns (PermitStorage storage ps) {
        bytes32 slot = _PERMIT_STORAGE_SLOT;
        assembly {
            ps.slot := slot
        }
    }

    function permit2() internal view returns (address) {
        PermitStorage storage ps = permitStorage();
        return ps.permit2;
    }

    function permit2ApproveAndTransfer(
        address _from,
        address _to,
        uint160 _amount,
        address _token,
        bytes memory data
    ) internal {
        IPermit2 _permit2 = IPermit2(permit2());

        permit2Approve(_token, data);

        _permit2.transferFrom(_from, _to, uint160(_amount), _token);
    }

    function permit2Approve(address _token, bytes memory _data) internal {
        IPermit2 _permit2 = IPermit2(permit2());
        if (_data.length > 0) {
            (
                uint160 allowanceAmount,
                uint48 nonce,
                uint48 expiration,
                uint256 sigDeadline,
                bytes memory signature
            ) = abi.decode(_data, (uint160, uint48, uint48, uint256, bytes));
            _permit2.permit(
                msg.sender,
                IPermit2.PermitSingle(
                    IPermit2.PermitDetails(
                        _token,
                        allowanceAmount,
                        expiration,
                        nonce
                    ),
                    address(this),
                    sigDeadline
                ),
                signature
            );
        }
    }

    function permit2TransferFrom(
        address _token,
        bytes memory _data,
        uint256 amount_
    ) internal {
        IPermit2 _permit2 = IPermit2(permit2());

        (uint256 nonce, uint256 deadline, bytes memory signature) = abi.decode(
            _data,
            (uint256, uint256, bytes)
        );
        _permit2.permitTransferFrom(
            IPermit2.PermitTransferFrom(
                IPermit2.TokenPermissions(_token, amount_),
                nonce,
                deadline
            ),
            IPermit2.SignatureTransferDetails(address(this), amount_),
            msg.sender,
            signature
        );
    }

    function permit(address _token, bytes memory _data) internal {
        if (_data.length > 0) {
            bool success;

            if (_data.length == 32 * 7) {
                (success, ) = _token.call(
                    abi.encodePacked(IERC20Permit.permit.selector, _data)
                );
            } else if (_data.length == 32 * 8) {
                (success, ) = _token.call(
                    abi.encodePacked(IDAIPermit.permit.selector, _data)
                );
            } else {
                revert InvalidPermitData();
            }
            if (!success) revert InvalidPermit();
        }
    }
}
