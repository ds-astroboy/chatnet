import React from 'react'
import AssetItem from './AssetItem'
import { GovernanceAccountType } from '@solana/spl-governance'
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'

interface AssetsListProps {
  panelView?: boolean
}

const AssetsList = ({ panelView }: AssetsListProps) => {
  const { getGovernancesByAccountTypes } = useGovernanceAssets()
  const programGovernances = getGovernancesByAccountTypes([
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ])
  return !panelView ? (
    <div className="mx_AssetsList">
      {programGovernances.map((x) => (
        <AssetItem key={x.pubkey.toBase58()} item={x} />
      ))}
    </div>
  ) : (
    <div className="mx_AssetsList">
      {programGovernances.map((x) => (
        <AssetItem key={x.pubkey.toBase58()} item={x} panelView />
      ))}
    </div>
  )
}
export default AssetsList
