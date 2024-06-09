// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

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

error UnAuthorizedCall(address);
error BridgeNotAdded(address);
error InvalidLength();

error AllSwapsFailed();
