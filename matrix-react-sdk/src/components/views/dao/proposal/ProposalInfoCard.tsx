import React, { useState, useEffect, useMemo } from "react";
import useProposal from "../../../../hooks/useProposal";
import useProposalVotes from "../../../../hooks/useProposalVotes";
import useRealmGovernance from "../../../../hooks/useRealmGovernance";
import { fmtUnixTime } from "../../../../utils/vote/formatting";
import { resolveProposalDescription } from "../../../../utils/vote/helpers";
import AccessibleButton from "../../elements/AccessibleButton";
import { VoteCountdown } from "../VoteCountdown";

import { YesNoVote } from "@solana/spl-governance";
import { useHasVoteTimeExpired } from "../../../../hooks/useHasVoteTimeExpired";
import { ProposalState } from "@solana/spl-governance";
import { GoverningTokenType } from "@solana/spl-governance";
import useWalletStore from "../../../../stores/vote/useWalletStore";
import AccessibleTooltipButton from "../../elements/AccessibleTooltipButton";
import Modal from "../../../../Modal";
import VoteCommentModal from "./VoteCommentModal";
import useRealm from "../../../../hooks/useRealm";

const ProposalInfoCard = () => {
  const [description, setDescription] = useState<string>("");
  const { ownTokenRecord, ownCouncilTokenRecord, ownVoterWeight } = useRealm();
  const { governance, proposal, voteRecordsByVoter, tokenType } =
    useWalletStore((s) => s.selectedProposal);

  const governance1 = useRealmGovernance(proposal?.account.governance);

  const wallet = useWalletStore((s) => s.current);
  const connected = useWalletStore((s) => s.connected);

  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!);

  const ownVoteRecord =
    wallet?.publicKey && voteRecordsByVoter[wallet.publicKey.toBase58()];

  const voterTokenRecord =
    tokenType === GoverningTokenType.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord;

  const isVoteCast = ownVoteRecord !== undefined;
  const isVoting =
    proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired;

  const isVoteEnabled =
    connected &&
    isVoting &&
    !isVoteCast &&
    voterTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(
      voterTokenRecord.account.governingTokenMint
    );

  const handleShowVoteModal = (vote: YesNoVote) => {
    Modal.createTrackedDialog("Input token amount", "", VoteCommentModal, {
      vote: vote!,
      voterTokenRecord: voterTokenRecord!,
    });
  };

  const voteTooltipContent = !connected
    ? "You need to connect your wallet to be able to vote"
    : !isVoting && isVoteCast
    ? "Proposal is not in a voting state anymore."
    : !voterTokenRecord ||
      !ownVoterWeight.hasMinAmountToVote(
        voterTokenRecord.account.governingTokenMint
      )
    ? "You don’t have governance power to vote in this realm"
    : "";

  let Button: React.ComponentType<
    React.ComponentProps<typeof AccessibleButton>
  > = AccessibleButton;
  if (voteTooltipContent) {
    Button = AccessibleTooltipButton;
  }
  const { yesVoteCount, noVoteCount, yesVoteProgress } = useProposalVotes(
    proposal?.account
  );

  const [yesProgress, noProgress] = useMemo(() => {
    if (yesVoteProgress >= 100) {
      return ["100%", "0%"];
    } else if (yesVoteProgress === 0 && noVoteCount === 0) {
      return ["0%", "0%"];
    } else {
      return [`${yesVoteProgress}%`, `${100 - yesVoteProgress}%`];
    }
  }, [yesVoteProgress]);

  useEffect(() => {
    const handleResolveDescription = async () => {
      const description = await resolveProposalDescription(
        proposal.account.descriptionLink!
      );
      setDescription(description);
    };
    if (proposal.account.descriptionLink) {
      handleResolveDescription();
    }
  }, [proposal.account.descriptionLink]);

  return (
    <div className="mx_ProposalInfoCard">
      <div className="mx_ProposalInfoCard_title">{proposal.account.name}</div>
      <div className="mx_ProposalInfoCard_description">{description}</div>
      <div className="mx_ProposalInfoCard_timeStatus">
        {proposal?.account.votingCompletedAt ? (
          `Time's Up!`
        ) : proposal?.account.votingAt ? (
          <VoteCountdown proposal={proposal.account} governance={governance1} />
        ) : (
          `Drafted ${fmtUnixTime(proposal?.account.draftAt)}`
        )}
      </div>
      <div className="mx_ProposalInfoCard_buttonGroup">
        <Button
          title={voteTooltipContent}
          onClick={() => handleShowVoteModal(YesNoVote.Yes)}
          disabled={!isVoteEnabled}
          className={`mx_ProposalInfoCard_button Yes ${
            !isVoteEnabled ? "disabled" : ""
          }`}
        >
          <div className="mx_ProposalInfoCard_button_label">Yes</div>
          <div className="mx_ProposalInfoCard_button_count">{yesVoteCount}</div>
          <div className="progressBar" style={{ width: yesProgress }}></div>
        </Button>
        <Button
          title={voteTooltipContent}
          onClick={() => handleShowVoteModal(YesNoVote.No)}
          disabled={!isVoteEnabled}
          className={`mx_ProposalInfoCard_button No ${
            !isVoteEnabled ? "disabled" : ""
          }`}
        >
          <div className="mx_ProposalInfoCard_button_label">No</div>
          <div className="mx_ProposalInfoCard_button_count">{noVoteCount}</div>
          <div className="progressBar" style={{ width: noProgress }}></div>
        </Button>
      </div>
    </div>
  );
};

export default ProposalInfoCard;
