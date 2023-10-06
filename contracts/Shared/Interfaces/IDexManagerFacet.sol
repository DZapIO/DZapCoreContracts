// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IDexManagerFacet {
    event DexAdded(address indexed dexAddress);
    event DexRemoved(address indexed dexAddress);
    event FunctionSignatureApprovalChanged(address indexed dex, bytes4 indexed functionSignature, bool indexed approved);

    /// @notice Register the address of a DEX contract to be approved for swapping.
    /// @param _dex The address of the DEX contract to be approved.
    function addDex(address _dex) external;

    /// @notice Batch register the address of DEX contracts to be approved for swapping.
    /// @param _dexs The addresses of the DEX contracts to be approved.
    function batchAddDex(address[] calldata _dexs) external;

    /// @notice Unregister the address of a DEX contract approved for swapping.
    /// @param _dex The address of the DEX contract to be unregistered.
    function removeDex(address _dex) external;

    /// @notice Batch unregister the addresses of DEX contracts approved for swapping.
    /// @param _dexs The addresses of the DEX contracts to be unregistered.
    function batchRemoveDex(address[] calldata _dexs) external;

    /// @notice checks if function is approved or not
    function isFunctionApproved(address _dex, bytes4 _signature) external returns (bool approved);

    /// @notice checks if dex is approved or not
    function isContractApproved(address _dex) external returns (bool approved);

    /// @notice Approve/Disapprove dex function signature
    function setFunctionApprovalBySignature(address _dex, bytes4 _signature, bool _approval) external;
}
