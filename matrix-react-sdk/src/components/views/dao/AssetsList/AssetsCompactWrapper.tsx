import React from 'react'
import AssetsList from './AssetsList'
import { ChevronRightIcon } from '@heroicons/react/solid'
import { TerminalIcon } from '@heroicons/react/outline'
import { GovernanceAccountType } from '@solana/spl-governance'
import {
  NEW_PROGRAM_VIEW,
  renderAddNewAssetTooltip,
} from '../assets'
import useRealm from '../../../../hooks/useRealm'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'
import EmptyState from '../EmptyState'

const AssetsCompactWrapper = () => {
  const {
    symbol,
    realm,
    ownVoterWeight,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()
  const connected = useWalletStore((s) => s.connected)
  const canCreateGovernance = realm
    ? ownVoterWeight.canCreateGovernance(realm)
    : null

  const newAssetToolTip = renderAddNewAssetTooltip(
    connected,
    canCreateGovernance,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse
  )

  const goToNewAssetForm = () => {
    // router.push(fmtUrlWithCluster(`/dao/${symbol}${NEW_PROGRAM_VIEW}`))
  }
  const { getGovernancesByAccountTypes } = useGovernanceAssets()
  const programGovernances = getGovernancesByAccountTypes([
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ])

  return (
    <div className="mx_AssetsCompactWrapper">
      <div className="mx_AssetsCompactWrapper_header">
        <h3 className="mx_AssetsCompactWrapper_title">Programs</h3>
        {programGovernances.length > 0 ? (
        //   <Link href={fmtUrlWithCluster(`/dao/${symbol}/assets`)}>
        <div className='mx_AssetsCompactWrapper_view'>            
          View
          <ChevronRightIcon className="mx_AssetsCompactWrapper_view_icon" />
        </div>
        ) : null}
      </div>
      {programGovernances.length > 0 ? (
        <div className="mx_AssetsCompactWrapper_assetsList" style={{ maxHeight: '350px' }}>
          <AssetsList panelView />
        </div>
      ) : (
        <EmptyState
          desc="No programs found"
          disableButton={!!newAssetToolTip}
          buttonText="New Program"
          icon={<TerminalIcon />}
          onClickButton={goToNewAssetForm}
          toolTipContent={newAssetToolTip}
        />
      )}
    </div>
  )
}

export default AssetsCompactWrapper
