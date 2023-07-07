import React, { useState, useEffect, FC } from 'react';
import {
    Proposal, ProposalState,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js';
import BaseAvatar from '../avatars/BaseAvatar';
import useRealmGovernance from '../../../hooks/useRealmGovernance';
import classNames from 'classnames';
import { VoteCountdown } from './VoteCountdown';
import { fmtUnixTime } from '../../../utils/vote/formatting';
import VoteResult from './VoteResult';
import { resolveProposalDescription } from '../../../utils/vote/helpers';
import { trimString } from "../../../hooks/trimString"
import useWalletStore from '../../../stores/vote/useWalletStore';
import dis from "../../../dispatcher/dispatcher";
import useRealm from '../../../hooks/useRealm';

interface IProps {
    proposalPk: PublicKey;
    proposal: Proposal
}

function getProposalState(state: ProposalState, hasVoteEnded: boolean) {
    if(state === ProposalState.Voting && !hasVoteEnded) {
        return true;
    }
    return false;
}

const DaoProposalCard: FC<IProps> = ({
    proposalPk,
    proposal
}) => {
    const [description, setDescription] = useState<string>("");
    const [creator, setCreator] = useState<string>("");
    const governance = useRealmGovernance(proposal.governance);
    const proposalState = getProposalState(
        proposal.state,
        governance && proposal.getTimeToVoteEnd(governance) < 0
    )
    const { symbol } = useRealm();

    const { proposalOwner } = useWalletStore((s) => s.selectedProposal);
    const { actions } = useWalletStore(s => s);

    const votingStatusClass = classNames({
        mx_DaoProposalCard_votingStatusWrap: true,
        voting: proposalState
    })

    useEffect(() => {
        if(proposalOwner) {
            const creator = trimString(proposalOwner.account.governingTokenOwner.toBase58());
            setCreator(creator);
        }
    }, [proposalOwner])

    useEffect(() => {
        const fetchProposalFromPk = async() => {
            await actions.fetchProposal(proposalPk);
        }
        fetchProposalFromPk();
    }, [])

    useEffect(() => {
        const handleResolveDescription = async () => {
          const description = await resolveProposalDescription(proposal.descriptionLink!)
          setDescription(description)
        }
        if (proposal.descriptionLink) {
          handleResolveDescription()
        }
    }, [proposal.descriptionLink])

    const showProposal = () => {
        dis.dispatch({
            action: "show_dao_proposal",
            proposalPk: proposalPk.toBase58(),
            symbol
        })
    }

    return (
        <>
            {(proposal && governance) ?
                <div className='mx_DaoProposalCard' onClick={showProposal}>
                    <div className='mx_DaoProposalCard_info'>
                        <div className='mx_DaoProposalCard_header'>
                            <BaseAvatar
                                className='mx_DaoProposalCard_creatorAvatar'
                                name={creator}
                                width={35}
                                height={35}
                            />
                            <div className='mx_DaoProposalCard_creatorName'>
                                Posted by {creator}
                            </div>
                        </div>
                        <div className='mx_DaoProposalCard_body'>
                            <div className='mx_DaoProposalCard_title'>
                                {proposal.name}
                            </div>
                            <div className='mx_DaoProposalCard_content'>
                                {description}
                            </div>
                        </div>
                        <div className='mx_DaoProposalCard_footer'>
                        {proposal.votingCompletedAt ? (
                            <VoteResult proposal={proposal}/>
                        ) : proposal.votingAt ? (
                            <VoteCountdown proposal={proposal} governance={governance} />
                        ) : (
                            `Drafted ${fmtUnixTime(proposal.draftAt)}`
                        )}
                        </div>
                    </div>
                    <div className={votingStatusClass}>
                        <div className='mx_DaoProposalCard_votingStatus'>
                            <div className='mx_DaoProposalCard_votingStatus_lable'>Voting</div>
                            <div className='mx_DaoProposalCard_votingStatus_result'>
                                { proposalState ? "Open" : "Close" }
                            </div>
                        </div>
                    </div>
                </div>
            :
            <></>
            }
        </>
    )
}

export default DaoProposalCard;