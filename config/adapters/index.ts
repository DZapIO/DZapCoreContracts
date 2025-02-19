import { CONTRACTS } from '../../constants'
import { DIRECT_TRANSFER_DEPLOYMENT_CONFIG } from './directTransfer'
import { GAS_ZIP_DEPLOYMENT_CONFIG } from './gasZip'
import { GENERIC_BRIDGE_DEPLOYMENT_CONFIG } from './genericBridge'
import { RELAYER_DEPLOYMENT_CONFIG } from './relayer'

export const AdapterDeploymentConfig = {
  [CONTRACTS.GenericBridgeAdapter]: GENERIC_BRIDGE_DEPLOYMENT_CONFIG,
  [CONTRACTS.DirectTransferAdapter]: DIRECT_TRANSFER_DEPLOYMENT_CONFIG,
  [CONTRACTS.GasZipAdapter]: GAS_ZIP_DEPLOYMENT_CONFIG,
  [CONTRACTS.RelayBridgeAdapter]: RELAYER_DEPLOYMENT_CONFIG,
}
