// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IAccessManagerFacet } from "./Shared/Interfaces/IAccessManagerFacet.sol";
import { IDexManagerFacet } from "./Shared/Interfaces/IDexManagerFacet.sol";
import { IFeesFacet } from "./Shared/Interfaces/IFeesFacet.sol";
import { IOwnershipFacet } from "./Shared/Interfaces/IOwnershipFacet.sol";
import { ICrossChainFacet } from "./Bridge/Interfaces/ICrossChainFacet.sol";
import { ISwapFacet } from "./Swap/Interfaces/ISwapFacet.sol";

interface IDZapDiamond is IFeesFacet, IAccessManagerFacet, IDexManagerFacet, IOwnershipFacet, ISwapFacet, ICrossChainFacet {
    error AllSwapsFailed();

    error OnlyContractOwner();

    error NoTransferToNullAddress();
    error NativeTransferFailed();
    error NullAddrIsNotAValidSpender();
    error NullAddrIsNotAnERC20Token();
    error InvalidAmount();
    error InsufficientBalance(uint256 amount, uint256 contractBalance);

    error ZeroAddress();
    error AlreadyInitialized();

    error NotAContract();
    error InvalidContract();

    error CannotAuthorizeSelf();
    error UnAuthorized();

    error InvalidFee();
    error InvalidFixedNativeFee();

    error InvalidReceiver();
    error InformationMismatch();
    error InvalidSendingToken();
    error NativeTokenNotSupported();
    error InvalidDestinationChain();
    error CannotBridgeToSameNetwork();

    error IntegratorNotAllowed();

    error ContractCallNotAllowed();
    error NoSwapFromZeroBalance();
    error SlippageTooHigh(uint256 minAmount, uint256 returnAmount);
    error SwapCallFailed(bytes reason);

    error BridgeCallFailed(bytes reason);
    error UnAuthorizedCallToFunction();
    error TokenInformationMismatch();

    error FeeTooHigh();

    error NotInitialized();
    error UnauthorizedCaller();

    error InvalidSwapDetails();

    error WithdrawFailed();

    error ShareTooHigh();
    error IntegratorNotActive();
}
