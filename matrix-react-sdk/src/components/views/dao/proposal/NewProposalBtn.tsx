import { PlusCircleIcon } from '@heroicons/react/outline'
import React from 'react'
import useRealm from '../../../../hooks/useRealm'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import AccessibleButton from '../../elements/AccessibleButton'
import AccessibleTooltipButton from '../../elements/AccessibleTooltipButton'
import dis from "../../../../dispatcher/dispatcher"

const NewProposalBtn = () => {
  const connected = useWalletStore((s) => s.connected)

  const {
    symbol,
    realm,
    governances,
    ownVoterWeight,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()

  const governanceItems = Object.values(governances)

  const canCreateProposal =
    realm &&
    governanceItems.some((g) =>
      ownVoterWeight.canCreateProposal(g.account.config)
    ) &&
    !toManyCommunityOutstandingProposalsForUser &&
    !toManyCouncilOutstandingProposalsForUse

  const tooltipContent = !connected
    ? 'Connect your wallet to create new proposal'
    : governanceItems.length === 0
    ? 'There is no governance configuration to create a new proposal'
    : !governanceItems.some((g) =>
        ownVoterWeight.canCreateProposal(g.account.config)
      )
    ? "You don't have enough governance power to create a new proposal"
    : toManyCommunityOutstandingProposalsForUser
    ? 'Too many community outstanding proposals. You need to finalize them before creating a new one.'
    : toManyCouncilOutstandingProposalsForUse
    ? 'Too many council outstanding proposals. You need to finalize them before creating a new one.'
    : ''

    let Button: React.ComponentType<React.ComponentProps<typeof AccessibleButton>> = AccessibleButton;
    if(tooltipContent) {
        Button = AccessibleTooltipButton;
    }

    const showNewProposal = () => {
      dis.dispatch({
        action: "show_newProposal",
      })
    }

  return (
    <>
        <Button 
            className='mx_NewProposalBtn'
            onClick={showNewProposal}
            title={tooltipContent}
            // disabled={!canCreateProposal}
        >
            <PlusCircleIcon className="mx_NewProposalBtn_icon" />
        </Button>
    </>
  )
}

export default NewProposalBtn
