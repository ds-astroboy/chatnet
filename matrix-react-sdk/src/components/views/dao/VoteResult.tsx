import { Proposal } from "@solana/spl-governance";
import React, { useState, useEffect, FC } from "react";
import useProposalVotes from "../../../hooks/useProposalVotes";

interface IProps {
    proposal: Proposal
}
const VoteResult: FC<IProps> = ({
    proposal
}) => {
    const {
        yesVoteCount,
    } = useProposalVotes(proposal)

    return (
        <div>{`Time's up - 👍️ Yes Vote `}<span>{yesVoteCount}</span></div>
    )
}

export default VoteResult;