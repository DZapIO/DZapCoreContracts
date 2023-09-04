// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { IntegratorInfo, FeeType, FeeInfo } from "../Types.sol";

interface IFeesFacet {
    /* ========= EVENTS ========= */

    event SetDzapFixedNativeFeeAmount(uint256 fee);
    event SetDzapTokenFee(uint256 fee);

    event SetFixedNativeFee(uint256 fee);

    event SetPlatformFee(uint256 fee);

    event SetMaxPlatformFee(uint256 fee);

    event SetIntegrator(address integrator, FeeType[] feeType, FeeInfo[] info);

    /* ========= RESTRICTED ========= */

    /**
     * @dev Initializes the FeesFacet with treasury address and max fee amount
     * No need to check initialized status because if max fee is 0 than there is no token fees
     * @param _protocolFeeVault Address to send fees to
     * @param _maxFixedNativeFee Max value of token fees
     */
    function initialize(
        address _protocolFeeVault,
        uint256 _maxFixedNativeFee,
        uint256 _maxNativeFee
    ) external;

    function setProtocolFeeVault(address _protocolFeeVault) external;

    function setIntegratorInfo(
        address _integrator,
        FeeType[] calldata _feeTypes,
        FeeInfo[] calldata _feeInfo
    ) external;

    function removeIntegrator(address _integrator) external;

    /* ========= VIEW FUNCTIONS ========= */

    function calcTokenFees(
        address _integrator,
        FeeType _feeType,
        uint256 _amount
    ) external view returns (uint256 totalFee, uint256 dzapShare);

    function calcFixedNativeFees(
        address _integrator,
        FeeType _feeType
    ) external view returns (uint256 fixedNativeFeeAmount, uint256 dzapShare);

    function isIntegratorAllowed(
        address _integrator
    ) external view returns (bool);

    function integratorFeeInfo(
        address _integrator,
        FeeType _feeType
    ) external view returns (FeeInfo memory);

    function maxTokenFee() external view returns (uint256);

    function maxFixedNativeFeeAmount()
        external
        view
        returns (uint256 _maxFixedNativeFee);

    function protocolFeeVault() external view returns (address);
}
