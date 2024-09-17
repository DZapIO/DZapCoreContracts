import { CHAIN_IDS } from './networks'

export const DEPLOYMENT_CONFIG = {
  '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6': {
    faceCut: {
      saltKey: 'DzapDiamondCut',
      value: 0,
      salt: '0xf2650e203279d2c9610434cc9074486477847350fb0aa836f2eb6bf226cacfbe',
      address: '0x3E9fd8DCfD992a5a254C5E43D2e8a7b60BfDA8D8',
      byteCode:
        '0x6080806040523461001657610db2908161001c8239f35b600080fdfe608080604052600436101561001357600080fd5b60003560e01c631f931c1c1461002857600080fd5b346107cb5760603660031901126107cb5767ffffffffffffffff600435116107cb573660236004350112156107cb57600435600401359067ffffffffffffffff82116107cb573660248360051b6004350101116107cb576001600160a01b0360243516602435036107cb5767ffffffffffffffff604435116107cb573660236044350112156107cb5767ffffffffffffffff60443560040135116107cb57366024604435600401356044350101116107cb576001600160a01b037fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c1320541633036107e6575061011d6101188261081b565b6107f5565b90602082828152018091602460043501915b60248260051b6004350101831061069457838561015461011860443560040135610833565b60443560048101358083529060240160208301376000602060443560040135830101526000915b80518310156104bb576020610190848361084f565b51015160038110156104a557806102d557506001600160a01b036101b4848361084f565b5151169160406101c4858461084f565b510151918251156102c35783156102b1576001600160601b03610207856001600160a01b0316600052600080516020610d5d833981519152602052604060002090565b54169182156102a3575b6000925b845184101561028e576001600160e01b0319610231858761084f565b511680600052600080516020610d3d8339815191526020526001600160a01b036040600020541661027c578682610267926109c9565b600193840193016001600160601b0316610215565b60405163a023275d60e01b8152600490fd5b50949150949250600191505b0191909261017b565b6102ac8561090e565b610211565b604051636347641d60e11b8152600490fd5b6040516307bc559560e41b8152600490fd5b600181036103e557506001600160a01b036102f0848361084f565b515116916040610300858461084f565b510151918251156102c35783156102b1576001600160601b03610343856001600160a01b0316600052600080516020610d5d833981519152602052604060002090565b54169182156103d7575b6000925b84518410156103c7576001600160e01b031961036d858761084f565b511680600052600080516020610d3d8339815191526020526001600160a01b03604060002054169087821461027c57826103bd89600195846103b888966001600160601b0398610abb565b6109c9565b0116930192610351565b509491509492506001915061029a565b6103e08561090e565b61034d565b600203610493576001600160a01b036103fe848361084f565b51511691604061040e858461084f565b510151928351156102c3576104815760005b83518110156104745760019061046e6001600160e01b0319610442838861084f565b511680600052600080516020610d3d8339815191526020526001600160a01b0360406000205416610abb565b01610420565b509260019194925061029a565b604051633ce4ef9160e11b8152600490fd5b60405163e548e6b560e01b8152600490fd5b634e487b7160e01b600052602160045260246000fd5b9091506040519060608201906060835251809152608082019060808160051b84010194916000905b82821061060057857f8faa70878671ccd212d20771b795c50af8fd3ff6cf27f4bde57e5d4de0aeb67386806105318b6001600160a01b03602435166020840152828103604084015285610879565b0390a16024356001600160a01b031661055d575161054b57005b6040516304c08b4360e51b8152600490fd5b8051156105ee5760008091306001600160a01b0360243516036105de575b6020815191016024355af43d156105d6573d9061059a61011883610833565b9182523d6000602084013e5b156105ad57005b604051630d7ddfa560e11b8152602060048201529081906105d2906024830190610879565b0390fd5b6060906105a6565b6105e9602435610d23565b61057b565b60405163211002b360e11b8152600490fd5b90919295607f1985820301825286516001600160a01b03815116825260208101519060038210156104a5576040916020840152015190606060408201526020608060608301928451809452019201906000905b808210610671575050506020806001929801920192019092916104e3565b82516001600160e01b031916845260209384019390920191600190910190610653565b823567ffffffffffffffff81116107cb5760606004358201360360231901126107cb576040519081606081011067ffffffffffffffff6060840111176107d057606082016040526024816004350101356001600160a01b03811681036107cb578252600360448260043501013510156107cb576004358101604481013560208401526064013567ffffffffffffffff81116107cb57366043828460043501010112156107cb5760248183600435010101356107516101188261081b565b9260208483815201903660448460051b868460043501010101116107cb5760448482600435010101915b60448460051b86846004350101010183106107a8575050505050604082015281526020928301920161012f565b82356001600160e01b0319811690036107cb57823581526020928301920161077b565b600080fd5b634e487b7160e01b600052604160045260246000fd5b6304efaedf60e31b8152600490fd5b6040519190601f01601f1916820167ffffffffffffffff8111838210176107d057604052565b67ffffffffffffffff81116107d05760051b60200190565b67ffffffffffffffff81116107d057601f01601f191660200190565b80518210156108635760209160051b010190565b634e487b7160e01b600052603260045260246000fd5b919082519283825260005b8481106108a5575050826000602080949584010152601f8019910116010190565b602081830181015184830182015201610884565b7fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131e8054821015610863576000527fb5c239a29faf02594141bbc5e6982a9b85ba2b4d59c3ed3baaf4cb8e5e11cbef0190600090565b61091781610d23565b7fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131e908154916001600160a01b038216600052600080516020610d5d83398151915260205282600160406000200155600160401b8310156107d057826109849160016109a4950190556108b9565b90919082549060031b916001600160a01b03809116831b921b1916179055565b565b919091805483101561086357600052601c60206000208360031c019260021b1690565b929163ffffffff60e01b8416916001600160a01b03600092848452610a22600080516020610d3d833981519152938460205260408620906001600160a01b038254916001600160601b0360a01b9060a01b169116179055565b1692838352600080516020610d5d83398151915260205260408320805490600160401b821015610aa75796610a648260409798996001610a81950181556109a6565b90919063ffffffff83549160031b9260e01c831b921b1916179055565b825260205220805473ffffffffffffffffffffffffffffffffffffffff19169091179055565b634e487b7160e01b85526041600452602485fd5b9190916001600160a01b038091168015610d1157308114610cff5763ffffffff60e01b809416600092818452600080516020610d3d833981519152926020918483526040948587205460a01c90838852600080516020610d5d8339815191529586865287892054926000199b8c8501948511610ceb57908991888c898c89808703610c7d575b505090525050508787525087892080548015610c69578c0190610b6482826109a6565b63ffffffff82549160031b1b191690555588528452868681205515610b8e575b5050505050509050565b7fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131e8054898101908111610c5557838852858552826001888a20015491808303610c23575b5050508054988915610c0f5760019798990191610bee836108b9565b909182549160031b1b19169055558552528220015580388080808080610b84565b634e487b7160e01b88526031600452602488fd5b610c2c906108b9565b90549060031b1c16610c4181610984846108b9565b885285855260018789200155388281610bd2565b634e487b7160e01b88526011600452602488fd5b634e487b7160e01b8b52603160045260248bfd5b610cde9784610a6493610c9c8a9487610cb29952828a528484206109a6565b90549060031b1c60e01b978896835252206109a6565b168b52838852898b20906001600160a01b038254916001600160601b0360a01b9060a01b169116179055565b873880888c898c89610b41565b634e487b7160e01b8b52601160045260248bfd5b60405163c3c5ec3760e01b8152600490fd5b604051631535ac5f60e31b8152600490fd5b3b15610d2b57565b6040516271a80360e91b8152600490fdfec8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131cc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131da2646970667358221220a59bba200d6b3c5591158860d72a3150cef41eb7a400dc39e14ecc118253991b64736f6c63430008130033',
    },
    diamond: {
      address: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
      saltKey: 'DzapDiamond',
      value: 0,
      salt: '0x779f6749c3f84267d934c49f846202a3d482523ccca30f880da40645dfd7e148',
      byteCode:
        '0x60806001600160401b03601f610c0138819003918201601f1916840191838311858410176105da57808592604094855283398101031261062a5761004e60206100478461066d565b930161066d565b916001600160a01b03168015610618577fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c132080546001600160a01b0319811683179091556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a36100c761064e565b916001835260005b602081106105f057506100e061064e565b60018152602036818301376307e4c70760e21b6100fc82610681565b5261010561062f565b6001600160a01b03909216825260006020830152604082015261012783610681565b5261013182610681565b506040519060208201908111828210176105da576040526000808252825b805182101561047957602061016483836106a4565b510151600381101561046357806102a157506001600160a01b0361018883836106a4565b515116604061019784846106a4565b51015180511561028f57811561027d576001600160a01b0382166000908152600080516020610be183398151915260205260409020546001600160601b039390841690811561026f575b6000915b835183101561025b576001600160e01b031961020184866106a4565b51166000818152600080516020610ba183398151915260205260409020549091906001600160a01b03166102495760018161023f888a94849661079d565b01169201916101e5565b60405163a023275d60e01b8152600490fd5b50959492505050600191505b01909161014f565b610278846106df565b6101e1565b604051636347641d60e11b8152600490fd5b6040516307bc559560e41b8152600490fd5b600181036103a657506001600160a01b036102bc83836106a4565b5151169260406102cc84846106a4565b51015180511561028f57841561027d576001600160a01b0385166000908152600080516020610be183398151915260205260409020546001600160601b0393908416908115610398575b6000915b8351831015610389576001600160e01b031961033684866106a4565b51166000818152600080516020610ba183398151915260205260409020546001600160a01b031690898214610249578261037f8b6001958461037a88968e98610888565b61079d565b011692019161031a565b50955050509160019150610267565b6103a1876106df565b610316565b600203610451576001600160a01b036103bf83836106a4565b5151169060406103cf84836106a4565b5101519182511561028f5761043f5760005b82518110156104335760019061042d6001600160e01b031961040383876106a4565b511680600052600080516020610ba1833981519152602052838060a01b0360406000205416610888565b016103e1565b50929160019150610267565b604051633ce4ef9160e11b8152600490fd5b60405163e548e6b560e01b8152600490fd5b634e487b7160e01b600052602160045260246000fd5b905060405190606082016060835281518091526080830190602060808260051b8601019301916000905b8282106105425750505050600060208301528181036040830152825180825260005b81811061052d57508282826000602080957f8faa70878671ccd212d20771b795c50af8fd3ff6cf27f4bde57e5d4de0aeb6739897010152601f801991011601030190a15161051b5760405160c29081610adf8239f35b6040516304c08b4360e51b8152600490fd5b806020809287010151828286010152016104c5565b858503607f19018152835180516001600160a01b0316865260208101519495939492939192906003821015610463576040916020840152015190606060408201526020608060608301928451809452019201906000905b8082106105b7575050506020806001929601920192019092916104a3565b82516001600160e01b031916845260209384019390920191600190910190610599565b634e487b7160e01b600052604160045260246000fd5b6020906105fb61062f565b6000815260008382015260606040820152828287010152016100cf565b60405163d92e233d60e01b8152600490fd5b600080fd5b60405190606082016001600160401b038111838210176105da57604052565b60408051919082016001600160401b038111838210176105da57604052565b51906001600160a01b038216820361062a57565b80511561068e5760200190565b634e487b7160e01b600052603260045260246000fd5b805182101561068e5760209160051b010190565b600080516020610bc1833981519152805482101561068e5760005260206000200190600090565b803b1561076957600080516020610bc183398151915280546001600160a01b0383166000908152600080516020610be1833981519152602052604090206001018190559190680100000000000000008310156105da5782610748916001610767950190556106b8565b90919082549060031b9160018060a01b03809116831b921b1916179055565b565b6040516271a80360e91b8152600490fd5b919091805483101561068e57600052601c60206000208360031c019260021b1690565b6001600160e01b031981166000818152600080516020610ba183398151915260208190526040822080546001600160a01b031660a09690961b6001600160a01b031916959095179094559194939092906001600160a01b0316808352600080516020610be18339815191526020526040832080549194919068010000000000000000821015610874579661083e826040979899600161085b9501815561077a565b90919063ffffffff83549160031b9260e01c831b921b1916179055565b82526020522080546001600160a01b0319169091179055565b634e487b7160e01b85526041600452602485fd5b9091906001600160a01b039081168015610acc57308114610aba5763ffffffff60e01b809416600092818452600080516020610ba1833981519152926020918483526040948587205460a01c90838852600080516020610be18339815191529586865287892054926000199b8c8501948511610aa657908991888c898c89808703610a38575b505090525050508787525087892080548015610a24578c0190610931828261077a565b63ffffffff82549160031b1b19169055558852845286868120551561095b575b5050505050509050565b600080516020610bc18339815191528054898101908111610a1057838852858552826001888a200154918083036109de575b50505080549889156109ca57600197989901916109a9836106b8565b909182549160031b1b19169055558552528220015580388080808080610951565b634e487b7160e01b88526031600452602488fd5b6109e7906106b8565b90549060031b1c166109fc81610748846106b8565b88528585526001878920015538828161098d565b634e487b7160e01b88526011600452602488fd5b634e487b7160e01b8b52603160045260248bfd5b610a99978461083e93610a578a9487610a6d9952828a5284842061077a565b90549060031b1c60e01b9788968352522061077a565b168b52838852898b2080546001600160a01b031660a09290921b6001600160a01b031916919091179055565b873880888c898c8961090e565b634e487b7160e01b8b52601160045260248bfd5b60405163c3c5ec3760e01b8152600490fd5b604051631535ac5f60e31b8152600490fdfe60806040523615608a57600080356001600160e01b03191681527fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c602052604081205473ffffffffffffffffffffffffffffffffffffffff168015607957818091368280378136915af43d82803e156075573d90f35b3d90fd5b631535ac5f60e31b60805260046080fd5b00fea2646970667358221220e8e86efb8ee77b86665fa5c5559071a2104f16237d867d1f302bb954f0f1998d64736f6c63430008130033c8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131cc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131ec8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131d00000000000000000000000045679cdf728abdcdfce0f03a8f1d22ba49babc720000000000000000000000003e9fd8dcfd992a5a254c5e43d2e8a7b60bfda8d8',
    },
  },
}

export const DZAP_ADDRESS = {
  [CHAIN_IDS.ETH_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.POLYGON_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.BSC_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.BSC_TESTNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.ARBITRUM_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.OPTIMISM_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.AVALANCHE_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.BASE_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.MANTA_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.SCROLL_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.TELOS_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.CORE_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.ROOTSTOCK_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.X_LAYER_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.ZKSYNC_MAINNET]: '0x66C96103d046826BEac8d01d8A8DF70ef7f18216',
  [CHAIN_IDS.LINEA_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.POLYGON_ZK_EVM_MAINNET]:
    '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.MODE_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.MANTLE_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.METIS_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.CELO_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.TAIKO_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.FIRE_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.ZETACHAIN_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.BLAST_MAINNET]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.BOBA_ETH]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.FRAXTAL]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
  [CHAIN_IDS.GRAVITY]: '0xF708e11A7C94abdE8f6217B13e6fE39C8b9cC0a6',
}

export const DZAP_STAGING_ADDRESS = {
  [CHAIN_IDS.ARBITRUM_MAINNET]: '0x53fEa6E30CE675d8D79d7610D66AD921001b7E63',
}
