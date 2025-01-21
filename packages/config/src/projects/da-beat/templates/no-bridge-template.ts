import {
  type DaBridgeContracts,
  type DaBridgeRisks,
  DaCommitteeSecurityRisk,
  DaUpgradeabilityRisk,
  type NoDaBridge,
} from '../types'
import type { DaLinks } from '../types/DaLinks'
import { DaRelayerFailureRisk } from '../types/DaRelayerFailureRisk'
import { linkByDA } from '../utils/link-by-da'

type TemplateSpecific = {
  /** DA layer name to automatically match projects with */
  layer: string
  createdAt: NoDaBridge['createdAt']
}

type Optionals = Partial<{
  links: Partial<DaLinks>
  risks: Partial<NoDaBridge['risks']>
  usedIn: NoDaBridge['usedIn']
  warnings: NoDaBridge['display']['warning']
  redWarnings: NoDaBridge['display']['redWarning']
  description: NoDaBridge['display']['description']
  permissions: NoDaBridge['permissions']
  contracts: NoDaBridge['contracts']
  technology: NoDaBridge['technology']
  otherConsiderations: NoDaBridge['otherConsiderations']
}>

type TemplateVars = Optionals & TemplateSpecific

export function NO_BRIDGE(template: TemplateVars): NoDaBridge {
  const id = 'no-bridge'
  const type = 'NoBridge'
  const description =
    template.description ??
    'This project does not have a DA bridge on Ethereum.'

  const technology = {
    description:
      template.technology?.description ?? 'There is no DA bridge on Ethereum.',
    risks: template.technology?.risks,
  }

  const usedIn =
    template.usedIn ??
    linkByDA({
      layer: (layer) => layer === template.layer,
      bridge: (bridge) => bridge === 'None',
    })
  const display = {
    name: 'No bridge',
    slug: `no-bridge`,
    description,
    links: {
      websites: [],
      documentation: [],
      repositories: [],
      apps: [],
      explorers: [],
      socialMedia: [],
      ...template.links,
    },
  }

  const risks = {
    committeeSecurity: DaCommitteeSecurityRisk.NoBridge,
    upgradeability: DaUpgradeabilityRisk.NoBridge,
    relayerFailure: DaRelayerFailureRisk.NoBridge,
    ...template.risks,
  } satisfies DaBridgeRisks

  const contracts: DaBridgeContracts = template.contracts ?? {
    risks: [],
    addresses: {},
  }

  const permissions = template.permissions ?? {}

  return {
    id,
    type,
    createdAt: template.createdAt,
    display,
    risks,
    technology,
    usedIn,
    permissions,
    contracts,
    otherConsiderations: template.otherConsiderations,
  }
}
