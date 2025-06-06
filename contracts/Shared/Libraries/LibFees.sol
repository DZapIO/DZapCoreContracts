// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { FullMath } from "../Libraries/FullMath.sol";
import { LibAsset } from "../Libraries/LibAsset.sol";
import { IntegratorInfo, FeeType, FeeInfo } from "../Types.sol";
import { IntegratorNotAllowed } from "../Errors.sol";

struct FeesStorage {
    mapping(address => IntegratorInfo) integratorInfo;
    uint256 maxTokenFee;
    uint256 maxFixedNativeFeeAmount;
    address protocolFeeVault;
    bool initialized;
}

/// @title LibFees
/// @notice This library contains helpers for calculating and transferring fees
library LibFees {
    bytes32 internal constant _FEE_STORAGE_SLOT = keccak256("dzap.storage.library.fees");
    uint256 internal constant _BPS_DENOMINATOR = 1e6; // 4 basis points

    event TokenFee(bytes32 indexed transactionId, address indexed integrator, FeeType feeType, address token, uint256 dzapFee, uint256 integratorFee);

    event FixedNativeFee(bytes32 indexed transactionId, address indexed integrator, FeeType feeType, uint256 dzapFee, uint256 integratorFee);

    function feesStorage() internal pure returns (FeesStorage storage ds) {
        bytes32 slot = _FEE_STORAGE_SLOT;
        assembly {
            ds.slot := slot
        }
    }

    function accrueFixedNativeFees(address _integrator, FeeType _feeType) internal {
        FeesStorage storage fs = feesStorage();
        FeeInfo memory feeInfo = fs.integratorInfo[_integrator].feeInfo[_feeType];
        uint256 fixedNativeFeeAmount = feeInfo.fixedNativeFeeAmount;

        if (fixedNativeFeeAmount != 0) {
            uint256 dzapShare = (fixedNativeFeeAmount * feeInfo.dzapFixedNativeShare) / _BPS_DENOMINATOR;
            if (fixedNativeFeeAmount > dzapShare) LibAsset.transferNativeToken(_integrator, fixedNativeFeeAmount - dzapShare);
            if (dzapShare != 0) LibAsset.transferNativeToken(fs.protocolFeeVault, dzapShare);
        }
    }

    function accrueTokenFees(address _integrator, address _token, uint256 _integratorFee, uint256 _dZapFee) internal {
        if (_integratorFee != 0) LibAsset.transferToken(_token, _integrator, _integratorFee);
        if (_dZapFee != 0) LibAsset.transferToken(_token, feesStorage().protocolFeeVault, _dZapFee);
    }

    function calcFixedNativeFees(FeeType _feeType, address _integrator) internal view returns (uint256 fixedNativeFeeAmount, uint256 dzapShare) {
        FeeInfo memory feeInfo = feesStorage().integratorInfo[_integrator].feeInfo[_feeType];

        fixedNativeFeeAmount = feeInfo.fixedNativeFeeAmount;
        if (fixedNativeFeeAmount != 0) dzapShare = (fixedNativeFeeAmount * feeInfo.dzapFixedNativeShare) / _BPS_DENOMINATOR;
    }

    function calculateTokenFees(uint256 _amountWithFee, FeeInfo memory _feeInfo) internal pure returns (uint256 totalFee, uint256 dZapShare) {
        if (_feeInfo.tokenFee != 0) {
            totalFee = FullMath.mulDiv(_amountWithFee, _feeInfo.tokenFee, _BPS_DENOMINATOR);

            dZapShare = FullMath.mulDiv(totalFee, _feeInfo.dzapTokenShare, _BPS_DENOMINATOR);
        }
    }

    function getIntegratorFeeInfo(address _integrator, FeeType _feeType) internal view returns (FeeInfo memory feeInfo) {
        if (!LibFees.isIntegratorAllowed(_integrator)) revert IntegratorNotAllowed();

        return feesStorage().integratorInfo[_integrator].feeInfo[_feeType];
    }

    function isIntegratorAllowed(address _integrator) internal view returns (bool) {
        FeesStorage storage fs = feesStorage();
        return fs.integratorInfo[_integrator].status;
    }
}
