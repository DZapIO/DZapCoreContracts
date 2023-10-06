// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IFeesFacet } from "../Interfaces/IFeesFacet.sol";
import { LibDiamond } from "../Libraries/LibDiamond.sol";
import { LibAccess } from "../Libraries/LibAccess.sol";
import { LibFees, FeesStorage } from "../Libraries/LibFees.sol";
import { InvalidFee, ZeroAddress, AlreadyInitialized, InvalidFixedNativeFee } from "../Errors.sol";
import { IntegratorInfo, FeeType, FeeInfo } from "../Types.sol";

/// @title Fees Facet
/// @notice Provides functionality for managing fees
contract FeesFacet is IFeesFacet {
    error FeeTooHigh();
    error ShareTooHigh();
    error IntegratorNotActive();

    /* ========= MODIFIER ========= */

    modifier onlyAuthorized() {
        if (msg.sender != LibDiamond.contractOwner()) LibAccess.enforceAccessControl();
        _;
    }

    /* ========= RESTRICTED ========= */

    /// @inheritdoc IFeesFacet
    function setProtocolFeeVault(address _protocolFeeVault) external onlyAuthorized {
        if (_protocolFeeVault == address(0)) revert ZeroAddress();

        FeesStorage storage fs = LibFees.feesStorage();
        fs.protocolFeeVault = _protocolFeeVault;
    }

    /// @inheritdoc IFeesFacet
    function setIntegratorInfo(address _integrator, FeeType[] calldata _feeTypes, FeeInfo[] calldata _feeInfo) external onlyAuthorized {
        if (_integrator == address(0)) revert ZeroAddress();
        uint256 length = _feeTypes.length;

        FeesStorage storage fs = LibFees.feesStorage();
        for (uint256 i = 0; i < length; ) {
            FeeInfo memory feeInfo = _feeInfo[i];

            if (feeInfo.dzapTokenShare > LibFees._BPS_DENOMINATOR || feeInfo.dzapFixedNativeShare > LibFees._BPS_DENOMINATOR) revert ShareTooHigh();
            if (feeInfo.tokenFee > LibFees._BPS_DENOMINATOR || feeInfo.tokenFee > fs.maxTokenFee) revert FeeTooHigh();
            if (feeInfo.fixedNativeFeeAmount > fs.maxFixedNativeFeeAmount) revert FeeTooHigh();

            if (!fs.integratorInfo[_integrator].status) fs.integratorInfo[_integrator].status = true;
            fs.integratorInfo[_integrator].feeInfo[_feeTypes[i]] = feeInfo;

            unchecked {
                ++i;
            }
        }

        emit SetIntegrator(_integrator, _feeTypes, _feeInfo);
    }

    /// @inheritdoc IFeesFacet
    function removeIntegrator(address _integrator) external onlyAuthorized {
        IntegratorInfo storage integratorInfo = LibFees.feesStorage().integratorInfo[_integrator];
        if (!integratorInfo.status) revert IntegratorNotActive();

        integratorInfo.status = false;
    }

    /* ========= VIEW FUNCTIONS ========= */

    function calcTokenFees(address _integrator, FeeType _feeType, uint256 _amount) external view returns (uint256 totalFee, uint256 dzapShare) {
        (totalFee, dzapShare) = LibFees.calculateTokenFees(_amount, LibFees.getIntegratorFeeInfo(_integrator, _feeType));
    }

    function calcFixedNativeFees(address _integrator, FeeType _feeType) external view returns (uint256 fixedNativeFeeAmount, uint256 dzapShare) {
        (fixedNativeFeeAmount, dzapShare) = LibFees.calcFixedNativeFees(_feeType, _integrator);
    }

    function isIntegratorAllowed(address _integrator) external view returns (bool) {
        return LibFees.isIntegratorAllowed(_integrator);
    }

    function integratorFeeInfo(address _integrator, FeeType _feeType) external view returns (FeeInfo memory) {
        FeesStorage storage fs = LibFees.feesStorage();
        return fs.integratorInfo[_integrator].feeInfo[_feeType];
    }

    function maxTokenFee() external view returns (uint256) {
        FeesStorage storage fs = LibFees.feesStorage();
        return fs.maxTokenFee;
    }

    function maxFixedNativeFeeAmount() external view returns (uint256 _maxFixedNativeFee) {
        FeesStorage storage fs = LibFees.feesStorage();
        return fs.maxFixedNativeFeeAmount;
    }

    function protocolFeeVault() external view returns (address) {
        FeesStorage storage fs = LibFees.feesStorage();
        return fs.protocolFeeVault;
    }
}
