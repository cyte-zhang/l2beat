import { EthereumAddress, UnixTime } from '@l2beat/shared-pure'
import {
  DA_BRIDGES,
  DA_LAYERS,
  NEW_CRYPTOGRAPHY,
  RISK_VIEW,
} from '../../common'
import { REASON_FOR_BEING_OTHER } from '../../common'
import { ProjectDiscovery } from '../../discovery/ProjectDiscovery'
import type { Layer2 } from '../../types'
import { Badge } from '../badges'
import { PolygoncdkDAC } from '../da-beat/templates/polygoncdk-template'
import { polygonCDKStack } from './templates/polygonCDKStack'

const discovery = new ProjectDiscovery('lumia')

const shared = new ProjectDiscovery('shared-polygon-cdk')
const bridge = shared.getContract('Bridge')

const membersCountDAC = discovery.getContractValue<number>(
  'LumiaDAC',
  'getAmountOfMembers',
)

const requiredSignaturesDAC = discovery.getContractValue<number>(
  'LumiaDAC',
  'requiredAmountOfSignatures',
)

const isForcedBatchDisallowed =
  discovery.getContractValue<string>('LumiaValidium', 'forceBatchAddress') !==
  '0x0000000000000000000000000000000000000000'

const upgradeability = {
  upgradableBy: ['LumiaDAC Upgrader'],
  upgradeDelay: 'None',
}

export const lumia: Layer2 = polygonCDKStack({
  addedAt: new UnixTime(1718181773), // 2024-06-12T08:42:53Z
  additionalBadges: [Badge.DA.DAC],
  reasonsForBeingOther: [REASON_FOR_BEING_OTHER.SMALL_DAC],
  additionalPurposes: ['Restaking', 'RWA'],
  display: {
    name: 'Lumia Prism',
    slug: 'lumia',
    description:
      'Lumia is a Validium built on the PolygonCDK stack focusing on real world assets, restaking and account abstraction.',
    links: {
      websites: ['https://lumia.org/'],
      apps: ['https://bridge.lumia.org/'],
      explorers: ['https://explorer.lumia.org/', 'https://lens.lumia.org/'],
      documentation: ['https://docs.lumia.org/'],
      repositories: [
        'https://github.com/orionprotocol/cdk-validium-permissionless-node',
      ],
      socialMedia: [
        'https://x.com/BuildOnLumia',
        'https://t.me/lumia_community',
        'https://discord.gg/Lumia',
      ],
    },
  },
  rpcUrl: 'https://mainnet-rpc.lumia.org',
  discovery,
  daProvider: {
    layer: DA_LAYERS.DAC,
    bridge: DA_BRIDGES.DAC_MEMBERS({
      requiredSignatures: requiredSignaturesDAC,
      membersCount: membersCountDAC,
    }),
    riskView: RISK_VIEW.DATA_EXTERNAL_DAC({
      membersCount: membersCountDAC,
      requiredSignatures: requiredSignaturesDAC,
    }),
    technology: {
      name: 'Data is not stored on chain',
      description:
        'The transaction data is not recorded on the Ethereum main chain. Transaction data is stored off-chain and only the hashes are posted onchain by the Sequencer, after being signed by the DAC members.',
      risks: [
        {
          category: 'Funds can be lost if',
          text: 'the external data becomes unavailable.',
          isCritical: true,
        },
      ],
      references: [
        {
          title:
            'PolygonValidiumStorageMigration.sol - Etherscan source code, sequenceBatchesValidium function',
          url: 'https://etherscan.io/address/0x10D296e8aDd0535be71639E5D1d1c30ae1C6bD4C#code#F1#L126',
        },
      ],
    },
  },
  rollupModuleContract: discovery.getContract('LumiaValidium'),
  rollupVerifierContract: discovery.getContract('Verifier'),
  isForcedBatchDisallowed,
  chainConfig: {
    name: 'lumia',
    chainId: 994873017,
    explorerUrl: 'https://explorer.lumia.org/',
    minTimestampForTvl: new UnixTime(1719499031),
  },
  nonTemplateEscrows: [
    shared.getEscrowDetails({
      address: bridge.address,
      tokens: '*',
      sharedEscrow: {
        type: 'AggLayer',
        nativeAsset: 'etherWrapped',
        wethAddress: EthereumAddress(
          '0x5A77f1443D16ee5761d310e38b62f77f726bC71c',
        ),
        tokensToAssignFromL1: ['LUMIA'],
      },
    }),
  ],
  nonTemplateTechnology: {
    newCryptography: {
      ...NEW_CRYPTOGRAPHY.ZK_BOTH,
    },
  },
  stateDerivation: {
    nodeSoftware:
      'Node software can be found [here](https://github.com/0xPolygon/cdk-validium-node).',
    compressionScheme: 'No compression scheme yet.',
    genesisState:
      'The genesis state, whose corresponding root is accessible as Batch 0 root in the `getRollupBatchNumToStateRoot(5,0)` method of PolygonRollupManager, is available [here](https://github.com/0xPolygonHermez/zkevm-contracts/blob/1ad7089d04910c319a257ff4f3674ffd6fc6e64e/tools/addRollupType/genesis.json).',
    dataFormat:
      'The trusted sequencer request signatures from DAC members off-chain, and posts hashed batches with signatures to the WirexPayChainValidium contract.',
  },

  nonTemplatePermissions: [
    {
      name: 'LocalAdmin',
      accounts: [
        discovery.formatPermissionedAccount(
          discovery.getContractValue('LumiaValidium', 'admin'),
        ),
      ],
      description:
        'Admin and ForceBatcher of the LumiaValidium contract, can set core system parameters like timeouts, sequencer, activate forced transactions, and set the DA committee members in the LumiaDAC contract.',
    },
    {
      name: 'LumiaDAC Upgrader',
      accounts: [
        discovery.formatPermissionedAccount(
          discovery.getContractValue('DACProxyAdmin', 'owner'),
        ),
      ],
      description:
        'Can upgrade the LumiaDAC contract and thus change the data availability rules any time.',
    },
  ],
  nonTemplateContracts: [
    discovery.getContractDetails('LumiaDAC', {
      description:
        'Validium committee contract that allows the owner to setup the members of the committee and stores the required amount of signatures threshold.',
      ...upgradeability,
    }),
  ],
  knowledgeNuggets: [],
  dataAvailabilitySolution: PolygoncdkDAC({
    bridge: {
      addedAt: new UnixTime(1738252392), // 2025-01-30T15:53:12+00:00
      dac: {
        requiredMembers: requiredSignaturesDAC,
        membersCount: membersCountDAC,
      },
    },
  }),
  milestones: [],
})
