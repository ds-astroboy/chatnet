import AccountsItems from './AccountsItems'
import HoldTokensTotalPrice from './HoldTokensTotalPrice'
import React from 'react'
import useRealm from '../../../../hooks/useRealm'
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'
import EmptyState from '../EmptyState'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import { TerminalIcon } from '@heroicons/react/outline'
export const NEW_TREASURY_ROUTE = `/treasury/new`
import dis from "../../../../dispatcher/dispatcher";
import AccessibleButton from "../../elements/AccessibleButton"

const AccountsCompactWrapper = () => {
  const { governedTokenAccounts } = useGovernanceAssets()
  const {
    ownVoterWeight,
    symbol,
    realm,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()
  const connected = useWalletStore((s) => s.connected)

  const goToNewAccountForm = () => {
    dis.dispatch({
      action: "show_newTreasury_form",
    })
  }

  const showAllVault = () => {
    dis.dispatch({
      action: "show_AllTreasuryAccount"
    })
  }

  const canCreateGovernance = realm
    ? ownVoterWeight.canCreateGovernance(realm)
    : null
  const isConnectedWithGovernanceCreationPermission =
    connected &&
    canCreateGovernance &&
    !toManyCommunityOutstandingProposalsForUser &&
    !toManyCouncilOutstandingProposalsForUse



  return (
    <div className="mx_AccountsCompactWrapper">
      <div className="mx_AccountsCompactWrapper_header">
        <div className="mx_AccountsCompactWrapper_title">Group Vault</div>
        {governedTokenAccounts.find((acc) => !acc.isNft) ? (
          <AccessibleButton className='mx_AccountsCompactWrapper_view' onClick={showAllVault}>
              View all
          </AccessibleButton>
        ) : null}
      </div>
      <HoldTokensTotalPrice />
      {governedTokenAccounts.find((acc) => !acc.isNft) ? (
        <div className="mx_AccountsCompactWrapper_AccountsItems">
          {governedTokenAccounts.every((x) => x.transferAddress) && (
            <AccountsItems />
          )}
        </div>
      ) : (
        <EmptyState
          desc="No treasury accounts found"
          disableButton={!isConnectedWithGovernanceCreationPermission}
          buttonText="New Treasury Account"
          icon={<TerminalIcon />}
          onClickButton={goToNewAccountForm}
        />
      )}
    </div>
  )
}

export default AccountsCompactWrapper
