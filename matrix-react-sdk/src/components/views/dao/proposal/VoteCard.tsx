import React, { FC, useState, useMemo } from 'react';
import useMembers from '../../../../hooks/useMembers';
import useProposalVotes from '../../../../hooks/useProposalVotes';
import useRealm from "../../../../hooks/useRealm";
import AccessibleButton from "../../elements/AccessibleButton";
import Spinner from '../../elements/Spinner';
import { VoteCountdown } from '../VoteCountdown';
import { fmtUnixTime } from '../../../../utils/vote/formatting';
import useRealmGovernance from '../../../../hooks/useRealmGovernance';

import { YesNoVote } from '@solana/spl-governance'
import { useHasVoteTimeExpired } from '../../../../hooks/useHasVoteTimeExpired'
import { ProposalState } from '@solana/spl-governance'
import { GoverningTokenType } from '@solana/spl-governance'
import useWalletStore from '../../../../stores/vote/useWalletStore';
import AccessibleTooltipButton from '../../elements/AccessibleTooltipButton';
import Modal from '../../../../Modal';
import VoteCommentModal from './VoteCommentModal';

const VoteCard: FC = () => {
    const { 
        ownTokenRecord,
        ownCouncilTokenRecord,
        realm,
        realmInfo,
        ownVoterWeight, 
        symbol 
    } = useRealm()
    const { members } = useMembers();
    const {
        governance,
        proposal,
        voteRecordsByVoter,
        tokenType,
    } = useWalletStore((s) => s.selectedProposal)

    const governance1 = useRealmGovernance(proposal?.account.governance);

    const wallet = useWalletStore((s) => s.current)
    const connected = useWalletStore((s) => s.connected)

    const {
        yesVoteCount,
        noVoteCount,
        yesVoteProgress
    } = useProposalVotes(proposal?.account);

    const totalVoteCount = useMemo(() => {
        return yesVoteCount + noVoteCount;
    }, [yesVoteCount, noVoteCount])

    const [yesProgress, noProgress] = useMemo(() => {
        if(yesVoteProgress >= 100) {
            return ["100%", "0%"]
        }
        else if(yesVoteProgress === 0 && noVoteCount === 0) {
            return ["0%", "0%"]
        }
        else {
            return [`${yesVoteProgress}%`, `${100 - yesVoteProgress}%`]
        }
    }, [yesVoteProgress])
  
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)

  const ownVoteRecord =
    wallet?.publicKey && voteRecordsByVoter[wallet.publicKey.toBase58()]

  const voterTokenRecord =
    tokenType === GoverningTokenType.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord

  const isVoteCast = ownVoteRecord !== undefined
  const isVoting =
    proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired

  const isVoteEnabled =
    connected &&
    isVoting &&
    !isVoteCast &&
    voterTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(
      voterTokenRecord.account.governingTokenMint
    )

  const handleShowVoteModal = (vote: YesNoVote) => {
    Modal.createTrackedDialog(
        'Input token amount',
        '',
        VoteCommentModal,
        {
            vote: vote!,
            voterTokenRecord: voterTokenRecord!
        }
    );
    }

  const voteTooltipContent = !connected
    ? 'You need to connect your wallet to be able to vote'
    : !isVoting && isVoteCast
    ? 'Proposal is not in a voting state anymore.'
    : !voterTokenRecord ||
      !ownVoterWeight.hasMinAmountToVote(
        voterTokenRecord.account.governingTokenMint
      )
    ? 'You don’t have governance power to vote in this realm'
    : ''

    let Button: React.ComponentType<React.ComponentProps<typeof AccessibleButton>> = AccessibleButton;
    
    return (
        <>
            {(realm && realmInfo && symbol === realmInfo.realmId.toBase58()) ? 
            <div className='mx_VoteCard'>
                <div className='mx_VoteCard_info'>
                    <div className='mx_VoteCard_title'>
                        {realmInfo.displayName}
                    </div>
                    <div className='mx_VoteCard_member'>
                        {members.length} Members
                    </div>
                    <div className='mx_VoteCard_detail'>
                        <div className='mx_VoteCard_category'>
                            Nfts
                        </div>
                        <div className='mx_VoteCard_condition'>
                            <div className='mx_VoteCard_condition_logo solana'></div>
                            <div className='mx_VoteCard_condition_content'>On-chain</div>
                        </div>
                    </div>
                    <div className='mx_VoteCard_buttons'>
                        <div className='mx_VoteCard_joinButton joined'>Joined</div>
                        <div className='mx_VoteCard_tools'>
                            <AccessibleButton
                                className='mx_VoteCard_button visit'
                                onClick={null}
                            />
                            <AccessibleButton
                                className='mx_VoteCard_button notification'
                                onClick={null}
                            />
                        </div>
                    </div>
                </div>
                <div className='mx_VoteCard_voteSection'>
                    <div className='mx_VoteCard_totalVoteCount'>
                        { totalVoteCount } votes
                    </div>
                    <div className='mx_VoteCard_voteButtonGroup'>
                        <Button
                            title={voteTooltipContent}
                            className='mx_VoteCard_voteButton yes'
                            onClick={() => handleShowVoteModal(YesNoVote.Yes)}
                            disabled={!isVoteEnabled}
                        >
                            <div className='mx_VoteCard_voteButton_label'>Yes</div>
                            <div className='mx_VoteCard_voteButton_count'>{ yesVoteCount }</div>
                            <div className='progressBar' style={{width: yesProgress}}></div>
                        </Button>
                        <Button
                            title={voteTooltipContent}
                            className='mx_VoteCard_voteButton no'
                            onClick={() => handleShowVoteModal(YesNoVote.No)}
                            disabled={!isVoteEnabled}
                        >
                            <div className='mx_VoteCard_voteButton_label'>No</div>
                            <div className='mx_VoteCard_voteButton_count'>{ noVoteCount }</div>
                            <div className='progressBar' style={{width: noProgress}}></div>
                        </Button>
                    </div>
                    <div className='mx_VoteCard_timeStatus'>
                        {proposal?.account.votingCompletedAt ? (
                            `Time's Up!`
                        ) : proposal?.account.votingAt ? (
                            <VoteCountdown proposal={proposal.account} governance={governance1} />
                        ) : (
                            `Drafted ${fmtUnixTime(proposal?.account.draftAt)}`
                        )}
                    </div>
                </div>
            </div>
            :
            <Spinner/>
            }
        </>
    )
}

export default VoteCard;