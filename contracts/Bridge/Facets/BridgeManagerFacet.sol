// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { LibAccess } from "../../Shared/Libraries/LibAccess.sol";
import { LibDiamond } from "../../Shared/Libraries/LibDiamond.sol";
import { LibBridgeStorage } from "../Libraries/LibBridgeStorage.sol";
import { IBridgeManagerFacet } from "../Interfaces/IBridgeManagerFacet.sol";

import { CrossChainStorage, CrossChainAllowedList } from "../Types.sol";
import { CannotAuthorizeSelf, BridgeNotAdded } from "../../Shared/Errors.sol";

contract BridgeManagerFacet is IBridgeManagerFacet {
    /* ========= MODIFIER ========= */

    modifier onlyAuthorized() {
        if (msg.sender != LibDiamond.contractOwner()) LibAccess.enforceAccessControl();
        _;
    }

    /* ========= VIEWS ========= */

    function isWhitelisted(address _bridge) external view returns (bool) {
        return LibBridgeStorage.getCrossChainStorage().allowlist[_bridge].isWhitelisted;
    }

    function getSelectorInfo(address _bridge, bytes4 _selector) external view returns (bool, uint256) {
        CrossChainAllowedList storage storageInfo = LibBridgeStorage.getCrossChainStorage().allowlist[_bridge];

        return (storageInfo.isWhitelisted, storageInfo.selectorToInfo[_selector]);
    }

    /* ========= RESTRICTED ========= */

    function addAggregatorsAndBridges(address[] calldata _bridgeAddresses) external onlyAuthorized {
        uint256 length = _bridgeAddresses.length;
        CrossChainStorage storage storageInfo = LibBridgeStorage.getCrossChainStorage();

        for (uint256 i = 0; i < length; ) {
            address bridgeAddress = _bridgeAddresses[i];

            if (bridgeAddress == address(this)) revert CannotAuthorizeSelf();

            storageInfo.allowlist[bridgeAddress].isWhitelisted = true;

            unchecked {
                ++i;
            }
        }

        emit BridgeAdded(_bridgeAddresses);
    }

    function removeAggregatorsAndBridges(address[] calldata _bridgeAddresses) external onlyAuthorized {
        uint256 length = _bridgeAddresses.length;
        CrossChainStorage storage storageInfo = LibBridgeStorage.getCrossChainStorage();

        for (uint256 i = 0; i < length; ) {
            address bridgeAddress = _bridgeAddresses[i];

            if (!storageInfo.allowlist[bridgeAddress].isWhitelisted) revert BridgeNotAdded(bridgeAddress);

            storageInfo.allowlist[bridgeAddress].isWhitelisted = false;

            unchecked {
                ++i;
            }
        }

        emit BridgeRemoved(_bridgeAddresses);
    }

    /// @notice Updates the amount offset of the specific function of the specific provider's router
    /// @param _bridgeAddresses Array of provider's routers
    /// @param _selectors Array of function selectors
    /// @param _offset Array of params associated with specified function
    function updateSelectorInfo(address[] calldata _bridgeAddresses, bytes4[] calldata _selectors, uint256[] calldata _offset) external onlyAuthorized {
        CrossChainStorage storage storageInfo = LibBridgeStorage.getCrossChainStorage();
        uint256 length = _bridgeAddresses.length;

        for (uint64 i; i < length; ) {
            if (_bridgeAddresses[i] == address(this)) revert CannotAuthorizeSelf();

            CrossChainAllowedList storage bridgeInfo = storageInfo.allowlist[_bridgeAddresses[i]];

            if (!bridgeInfo.isWhitelisted) bridgeInfo.isWhitelisted = true;
            bridgeInfo.selectorToInfo[_selectors[i]] = _offset[i];
            unchecked {
                ++i;
            }
        }

        emit SelectorToInfoUpdated(_bridgeAddresses, _selectors, _offset);
    }
}
