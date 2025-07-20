// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IWhitelistingManagerFacet {
    event DexAdded(address indexed dex);
    event DexRemoved(address indexed dex);
    event DexesAdded(address[] dexes);
    event DexesRemoved(address[] dexes);

    event BridgeAdded(address indexed bridge);
    event BridgeRemoved(address indexed bridge);
    event BridgesAdded(address[] bridges);
    event BridgesRemoved(address[] bridges);

    event AdapterAdded(address indexed adapter);
    event AdapterRemoved(address indexed adapter);
    event AdaptersAdded(address[] adapters);
    event AdaptersRemoved(address[] adapters);

    /* ========= VIEWS ========= */

    /// @notice checks if dex is approved or not
    function isDexWhitelisted(address _dex) external view returns (bool);

    /// @notice checks if bridge is approved or not
    function isBridgeWhitelisted(address _bridge) external view returns (bool);

    /// @notice checks if adapter is approved or not
    function isAdapterWhitelisted(address _adapter) external view returns (bool);

    /* ========= ADD FUNCTIONS ========= */

    function addDexesAndBridges(address[] calldata _dexs, address[] calldata _bridges) external;

    function removeDexesAndBridges(address[] calldata _dexs, address[] calldata _bridges) external;

    /* ========= DEX MANAGEMENT FUNCTIONS ========= */

    /// @notice Whitelist the address of a DEX contract to be approved for swapping.
    function addDex(address _dex) external;

    /// @notice Whitelist the addresses of DEX contracts to be approved for swapping.
    function addDexs(address[] calldata _dexs) external;

    /// @notice Remove the address of a DEX contract to be approved for swapping.
    function removeDex(address _dex) external;

    /// @notice Remove the addresses of DEX contracts to be approved for swapping.
    function removeDexs(address[] calldata _dexs) external;

    /* ========= BRIDGE MANAGEMENT FUNCTIONS ========= */

    /// @notice Whitelist the address of a bridge contract to be approved for swapping.
    function addBridge(address _bridge) external;

    /// @notice Whitelist the addresses of bridge contracts to be approved for swapping.
    function addBridges(address[] calldata _bridges) external;

    /// @notice Remove the address of a bridge contract to be approved for swapping.
    function removeBridge(address _bridge) external;

    /// @notice Remove the addresses of bridge contracts to be approved for swapping.
    function removeBridges(address[] calldata _bridges) external;

    /* ========= ADAPTER MANAGEMENT FUNCTIONS ========= */

    /// @notice Whitelist the address of an adapter contract to be approved for swapping.
    function addAdapter(address _adapter) external;

    /// @notice Whitelist the addresses of adapter contracts to be approved for swapping.
    function addAdapters(address[] calldata _adapters) external;

    /// @notice Remove the address of an adapter contract to be approved for swapping.
    function removeAdapter(address _adapter) external;

    /// @notice Remove the addresses of adapter contracts to be approved for swapping.
    function removeAdapters(address[] calldata _adapters) external;
}
