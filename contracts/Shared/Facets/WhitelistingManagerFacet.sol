// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { AuthorizationGuard } from "../Helpers/AuthorizationGuard.sol";
import { LibAllowList } from "../Libraries/LibAllowList.sol";
import { IWhitelistingManagerFacet } from "../Interfaces/IWhitelistingManagerFacet.sol";

/// @title DZap Whitelisting Manager Facet
/// @notice Facet contract for managing approved DEXs to be used in swaps.
contract WhitelistingManagerFacet is IWhitelistingManagerFacet, AuthorizationGuard {
    // Events for transparency and monitoring

    /* ========= VIEWS ========= */

    /// @inheritdoc IWhitelistingManagerFacet
    function isDexWhitelisted(address _dex) external view returns (bool) {
        return LibAllowList.isDexWhitelisted(_dex);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function isBridgeWhitelisted(address _bridge) external view returns (bool) {
        return LibAllowList.isBridgeWhitelisted(_bridge);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function isAdapterWhitelisted(address _adapter) external view returns (bool) {
        return LibAllowList.isAdapterWhitelisted(_adapter);
    }

    /* ========= DEX MANAGEMENT FUNCTIONS ========= */

    /// @inheritdoc IWhitelistingManagerFacet
    function addDex(address _dex) external onlyAuthorized {
        LibAllowList.addDex(_dex);
        emit DexAdded(_dex);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function removeDex(address _dex) external onlyAuthorized {
        LibAllowList.removeDex(_dex);
        emit DexRemoved(_dex);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function addDexs(address[] calldata _dexs) external onlyAuthorized {
        LibAllowList.addDexes(_dexs);
        emit DexesAdded(_dexs);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function removeDexs(address[] calldata _dexs) external onlyAuthorized {
        LibAllowList.removeDexes(_dexs);
        emit DexesRemoved(_dexs);
    }

    /* ========= BATCH FUNCTION ========= */

    /// @inheritdoc IWhitelistingManagerFacet
    function addDexesAndBridges(address[] calldata _dexs, address[] calldata _bridges) external onlyAuthorized {
        LibAllowList.addDexes(_dexs);
        LibAllowList.addBridges(_bridges);
        emit DexesAdded(_dexs);
        emit BridgesAdded(_bridges);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function removeDexesAndBridges(address[] calldata _dexs, address[] calldata _bridges) external onlyAuthorized {
        LibAllowList.removeDexes(_dexs);
        LibAllowList.removeBridges(_bridges);
        emit DexesRemoved(_dexs);
        emit BridgesRemoved(_bridges);
    }

    /* ========= BRIDGE MANAGEMENT FUNCTIONS ========= */

    /// @inheritdoc IWhitelistingManagerFacet
    function addBridge(address _bridge) external onlyAuthorized {
        LibAllowList.addBridge(_bridge);
        emit BridgeAdded(_bridge);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function removeBridge(address _bridge) external onlyAuthorized {
        LibAllowList.removeBridge(_bridge);
        emit BridgeRemoved(_bridge);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function addBridges(address[] calldata _bridges) external onlyAuthorized {
        LibAllowList.addBridges(_bridges);
        emit BridgesAdded(_bridges);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function removeBridges(address[] calldata _bridges) external onlyAuthorized {
        LibAllowList.removeBridges(_bridges);
        emit BridgesRemoved(_bridges);
    }

    /* ========= ADAPTERS MANAGEMENT FUNCTIONS ========= */

    /// @inheritdoc IWhitelistingManagerFacet
    function addAdapter(address _adapter) external onlyAuthorized {
        LibAllowList.addAdapter(_adapter);
        emit AdapterAdded(_adapter);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function removeAdapter(address _adapter) external onlyAuthorized {
        LibAllowList.removeAdapter(_adapter);
        emit AdapterRemoved(_adapter);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function addAdapters(address[] calldata _adapters) external onlyAuthorized {
        LibAllowList.addAdapters(_adapters);
        emit AdaptersAdded(_adapters);
    }

    /// @inheritdoc IWhitelistingManagerFacet
    function removeAdapters(address[] calldata _adapters) external onlyAuthorized {
        LibAllowList.removeAdapters(_adapters);
        emit AdaptersRemoved(_adapters);
    }
}
