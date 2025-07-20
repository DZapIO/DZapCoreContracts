// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

error OnlyContractOwner();
error UnauthorizedCaller();
error UnAuthorized();
error CannotAuthorizeSelf();

error AlreadyInitialized();

error InsufficientBalance(uint256 amount, uint256 contractBalance);
error SlippageTooHigh(uint256 minAmount, uint256 returnAmount);

error TransferAmountMismatch();
error NoBridgeFromZeroAmount();
error NoSwapFromZeroAmount();

error ZeroAddress();
error NoTransferToNullAddress();
error NullAddrIsNotAValidSpender();
error NullAddrIsNotAValidRecipient();
error NativeTokenNotSupported();
error InvalidEncodedAddress();

error NotAContract();
error BridgeNotWhitelisted(address bridge);
error AdapterNotWhitelisted(address adapter);
error DexNotWhitelised(address dex);

error InvalidPermitType();
error CannotBridgeToSameNetwork();

error SwapCallFailed(address target, bytes4 funSig, bytes reason);
error BridgeCallFailed(address target, bytes4 funSig, bytes reason);
error AdapterCallFailed(address adapter, bytes res);
error NativeCallFailed(bytes reason);
error Erc20CallFailed(bytes reason);
error NativeTransferFailed();
