// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { CallToFunctionInfo, CrossChainStorage } from "../Types.sol";

/// @notice Provides mappings for all facets that may need them
library LibBridgeStorage {
    bytes32 internal constant CROSS_CHAIN_NAMESAPCE =
        keccak256("dzap.library.cross.chain");

    /// @dev Fetch local storage for Generic Cross Chain
    function getCrossChainStorage()
        internal
        pure
        returns (CrossChainStorage storage cs)
    {
        bytes32 position = CROSS_CHAIN_NAMESAPCE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cs.slot := position
        }
    }
}
