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

    function addAggregatorsAndBridges(address[] calldata _bridgeAddresses) external;

    function removeAggregatorsAndBridges(address[] calldata _bridgeAddresses) external;

    function updateSelectorInfo(address[] calldata _bridgeAddresses, bytes4[] calldata _selectors, uint256[] calldata _offset) external;
}
