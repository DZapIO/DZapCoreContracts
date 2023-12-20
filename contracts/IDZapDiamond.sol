// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { IAccessManagerFacet } from "./Shared/Interfaces/IAccessManagerFacet.sol";
import { IDexManagerFacet } from "./Shared/Interfaces/IDexManagerFacet.sol";
import { IFeesFacet } from "./Shared/Interfaces/IFeesFacet.sol";
import { ICrossChainFacet } from "./Bridge/Interfaces/ICrossChainFacet.sol";
import { ISwapFacet } from "./Swap/Interfaces/ISwapFacet.sol";

interface IDZapDiamond is IFeesFacet, IAccessManagerFacet, IDexManagerFacet, ISwapFacet, ICrossChainFacet {}
