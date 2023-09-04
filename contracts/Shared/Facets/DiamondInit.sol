// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibDiamond } from "../Libraries/LibDiamond.sol";
import { LibFees, FeesStorage } from "../Libraries/LibFees.sol";
import { LibPermit, PermitStorage } from "../Libraries/LibPermit.sol";
import { IDiamondInit } from "../Interfaces/IDiamondInit.sol";

import { ZeroAddress, FeeTooHigh, InvalidFee, AlreadyInitialized } from "../Errors.sol";

contract DiamondInit is IDiamondInit {
    function initialize(
        address _permit2,
        address _protocolFeeVault,
        uint256 _maxTokenFee,
        uint256 _maxFixedNativeFeeAmount
    ) external {
        LibDiamond.enforceIsContractOwner();

        if (_permit2 == address(0)) {
            revert ZeroAddress();
        }

        if (_protocolFeeVault == address(0)) {
            revert ZeroAddress();
        }
        if (_maxTokenFee == 0) {
            revert InvalidFee();
        }
        if (_maxTokenFee > LibFees._BPS_DENOMINATOR) {
            revert FeeTooHigh();
        }

        PermitStorage storage ps = LibPermit.permitStorage();
        FeesStorage storage fs = LibFees.feesStorage();

        if (ps.initialized) {
            revert AlreadyInitialized();
        }

        if (fs.initialized) {
            revert AlreadyInitialized();
        }

        ps.permit2 = _permit2;
        ps.initialized = true;

        fs.protocolFeeVault = _protocolFeeVault;
        fs.maxTokenFee = _maxTokenFee;
        fs.maxFixedNativeFeeAmount = _maxFixedNativeFeeAmount;
        fs.initialized = true;
    }

    // function initializeFee(
    //     address _protocolFeeVault,
    //     uint256 _maxTokenFee,
    //     uint256 _maxFixedNativeFeeAmount
    // ) external {
    //     LibDiamond.enforceIsContractOwner();

    //     if (_protocolFeeVault == address(0)) {
    //         revert ZeroAddress();
    //     }
    //     if (_maxTokenFee == 0) {
    //         revert InvalidFee();
    //     }
    //     if (_maxTokenFee > LibFees._BPS_DENOMINATOR) {
    //         revert FeeTooHigh();
    //     }

    //     FeesStorage storage fs = LibFees.feesStorage();

    //     if (fs.initialized) {
    //         revert AlreadyInitialized();
    //     }

    //     fs.protocolFeeVault = _protocolFeeVault;
    //     fs.maxTokenFee = _maxTokenFee;
    //     fs.maxFixedNativeFeeAmount = _maxFixedNativeFeeAmount;
    //     fs.initialized = true;
    // }

    // function initializePermit(address _permit2) external {
    //     LibDiamond.enforceIsContractOwner();

    //     if (_permit2 == address(0)) {
    //         revert ZeroAddress();
    //     }

    //     PermitStorage storage ps = LibPermit.permitStorage();

    //     if (ps.initialized) {
    //         revert AlreadyInitialized();
    //     }

    //     ps.permit2 = _permit2;
    //     ps.initialized = true;
    // }
}
