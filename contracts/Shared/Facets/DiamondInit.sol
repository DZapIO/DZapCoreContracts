// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibDiamond } from "../Libraries/LibDiamond.sol";
import { LibGlobalStorage, GlobalStorage } from "../Libraries/LibGlobalStorage.sol";
import { IDiamondInit } from "../Interfaces/IDiamondInit.sol";
import { ZeroAddress, AlreadyInitialized, CannotAuthorizeSelf } from "../Errors.sol";

/**
 * @title DiamondInit
 * @author DZap
 * @notice Initialize the init variables for dZap diamond contract
 */
contract DiamondInit is IDiamondInit {
    // solhint-disable-next-line code-complexity
    function initialize(address _protocolFeeVault, address _feeValidator, address _refundVault, address _permit2) external {
        LibDiamond.enforceIsContractOwner();

        if (_protocolFeeVault == address(0)) revert ZeroAddress();
        if (_feeValidator == address(0)) revert ZeroAddress();
        if (_permit2 == address(0)) revert ZeroAddress();
        if (_refundVault == address(0)) revert ZeroAddress();

        if (_protocolFeeVault == address(this)) revert CannotAuthorizeSelf();
        if (_refundVault == address(this)) revert CannotAuthorizeSelf();

        GlobalStorage storage gs = LibGlobalStorage.globalStorage();

        if (gs.initialized) revert AlreadyInitialized();

        gs.permit2 = _permit2;
        gs.protocolFeeVault = _protocolFeeVault;
        gs.feeValidator = _feeValidator;
        gs.refundVault = _refundVault;

        gs.initialized = true;
    }
}
