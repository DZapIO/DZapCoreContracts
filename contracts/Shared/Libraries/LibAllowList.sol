// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAsset } from "../Libraries/LibAsset.sol";
import { BridgeNotWhitelisted, AdapterNotWhitelisted, DexNotWhitelised, CannotAuthorizeSelf, NotAContract, ZeroAddress } from "../Errors.sol";

struct AllowListStorage {
    mapping(address => bool) dexAllowlist;
    mapping(address => bool) adaptersAllowlist;
    mapping(address => bool) bridgeAllowlist;
}

/**
 * @title LibAllowList
 * @author DZap
 * @notice Library for managing and accessing the conract address allow list
 */
library LibAllowList {
    bytes32 internal constant ALLOWLIST_NAMESPACE = keccak256("dzap.library.allow.whitelist");

    /// @dev Fetch local storage struct
    function allowListStorage() internal pure returns (AllowListStorage storage als) {
        bytes32 position = ALLOWLIST_NAMESPACE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            als.slot := position
        }
    }

    /* ========= VIEWS ========= */

    function isDexWhitelisted(address _dex) internal view returns (bool) {
        return allowListStorage().dexAllowlist[_dex];
    }

    function isAdapterWhitelisted(address _adapter) internal view returns (bool) {
        return allowListStorage().adaptersAllowlist[_adapter];
    }

    function isBridgeWhitelisted(address _bridge) internal view returns (bool) {
        return allowListStorage().bridgeAllowlist[_bridge];
    }

    /* ========= MUTATIONS ========= */

    function addDex(address _dex) internal {
        if (_dex == address(0)) revert ZeroAddress();
        if (_dex == address(this)) revert CannotAuthorizeSelf();
        if (!LibAsset.isContract(_dex)) revert NotAContract();
        allowListStorage().dexAllowlist[_dex] = true;
    }

    function addDexes(address[] memory _dexes) internal {
        AllowListStorage storage als = allowListStorage();
        for (uint256 i; i < _dexes.length; ++i) {
            address dex = _dexes[i];
            if (dex == address(0)) revert ZeroAddress();
            if (dex == address(this)) revert CannotAuthorizeSelf();
            if (!LibAsset.isContract(dex)) revert NotAContract();
            als.dexAllowlist[dex] = true;
        }
    }

    function removeDex(address _dex) internal {
        AllowListStorage storage als = allowListStorage();
        if (!als.dexAllowlist[_dex]) {
            revert DexNotWhitelised(_dex);
        }
        als.dexAllowlist[_dex] = false;
    }

    function removeDexes(address[] memory _dexes) internal {
        AllowListStorage storage als = allowListStorage();
        for (uint256 i; i < _dexes.length; ++i) {
            if (!als.dexAllowlist[_dexes[i]]) {
                revert DexNotWhitelised(_dexes[i]);
            }
            als.dexAllowlist[_dexes[i]] = false;
        }
    }

    function addBridge(address _bridge) internal {
        if (_bridge == address(0)) revert ZeroAddress();
        if (_bridge == address(this)) revert CannotAuthorizeSelf();
        if (!LibAsset.isContract(_bridge)) revert NotAContract();
        allowListStorage().bridgeAllowlist[_bridge] = true;
    }

    function addBridges(address[] memory _bridges) internal {
        AllowListStorage storage als = allowListStorage();
        for (uint256 i; i < _bridges.length; ++i) {
            address bridge = _bridges[i];
            if (bridge == address(0)) revert ZeroAddress();
            if (bridge == address(this)) revert CannotAuthorizeSelf();
            if (!LibAsset.isContract(bridge)) revert NotAContract();
            als.bridgeAllowlist[bridge] = true;
        }
    }

    function removeBridge(address _bridge) internal {
        AllowListStorage storage als = allowListStorage();
        if (!als.bridgeAllowlist[_bridge]) {
            revert BridgeNotWhitelisted(_bridge);
        }
        als.bridgeAllowlist[_bridge] = false;
    }

    function removeBridges(address[] memory _bridges) internal {
        AllowListStorage storage als = allowListStorage();
        for (uint256 i; i < _bridges.length; ++i) {
            if (!als.bridgeAllowlist[_bridges[i]]) {
                revert BridgeNotWhitelisted(_bridges[i]);
            }
            als.bridgeAllowlist[_bridges[i]] = false;
        }
    }

    function addAdapter(address _adapter) internal {
        if (_adapter == address(0)) revert ZeroAddress();
        if (_adapter == address(this)) revert CannotAuthorizeSelf();
        if (!LibAsset.isContract(_adapter)) revert NotAContract();
        allowListStorage().adaptersAllowlist[_adapter] = true;
    }

    function addAdapters(address[] memory _adapters) internal {
        AllowListStorage storage als = allowListStorage();
        for (uint256 i; i < _adapters.length; ++i) {
            address adapter = _adapters[i];
            if (adapter == address(0)) revert ZeroAddress();
            if (adapter == address(this)) revert CannotAuthorizeSelf();
            if (!LibAsset.isContract(adapter)) revert NotAContract();
            als.adaptersAllowlist[adapter] = true;
        }
    }

    function removeAdapter(address _adapter) internal {
        AllowListStorage storage als = allowListStorage();
        if (!als.adaptersAllowlist[_adapter]) {
            revert AdapterNotWhitelisted(_adapter);
        }
        als.adaptersAllowlist[_adapter] = false;
    }

    function removeAdapters(address[] memory _adapters) internal {
        AllowListStorage storage als = allowListStorage();
        for (uint256 i; i < _adapters.length; ++i) {
            if (!als.adaptersAllowlist[_adapters[i]]) {
                revert AdapterNotWhitelisted(_adapters[i]);
            }
            als.adaptersAllowlist[_adapters[i]] = false;
        }
    }
}
