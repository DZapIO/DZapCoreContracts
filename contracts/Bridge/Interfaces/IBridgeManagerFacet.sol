// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IBridgeManagerFacet {
    /* ========= EVENTS ========= */

    event BridgeAdded(address[] bridges);
    event BridgeRemoved(address[] bridges);
    event SelectorToInfoUpdated(address[] bridges, bytes4[] selectors, uint256[] info);

    /* ========= VIEWS ========= */

    function isWhitelisted(address _bridge) external view returns (bool);

    function getSelectorInfo(address _bridge, bytes4 _selector) external view returns (bool, uint256);

    /* ========= EXTERNAL ========= */

    /// @notice Whitelist bridges and aggregators
    /// @param _bridgeAddresses address of bridges and aggregator to whitelist
    function addAggregatorsAndBridges(address[] calldata _bridgeAddresses) external;

    /// @notice Remove whitelisted bridges and aggregators
    /// @param _bridgeAddresses address of bridges and aggregator to remove
    function removeAggregatorsAndBridges(address[] calldata _bridgeAddresses) external;

    /// @notice Updates the amount offset of the specific function of the specific provider's router
    /// @param _bridgeAddresses Array of provider's routers
    /// @param _selectors Array of function selectors
    /// @param _offset Array of offsets
    function updateSelectorInfo(address[] calldata _bridgeAddresses, bytes4[] calldata _selectors, uint256[] calldata _offset) external;
}
