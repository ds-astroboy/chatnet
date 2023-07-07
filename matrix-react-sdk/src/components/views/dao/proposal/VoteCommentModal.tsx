import React, { FunctionComponent, useState } from "react";

import {
  ChatMessageBody,
  ChatMessageBodyType,
  YesNoVote,
} from "@solana/spl-governance";
import { RpcContext } from "@solana/spl-governance";
import useWalletStore from "../../../../stores/vote/useWalletStore";
import useRealm from "../../../../hooks/useRealm";
import { castVote } from "../../../../actions/castVote";

// import { notify } from '../utils/notifications'
import { TokenOwnerRecord } from "@solana/spl-governance";
import { ProgramAccount } from "@solana/spl-governance";
import { getProgramVersionForRealm } from "../../../../apis/registry/api";
import useVotePluginsClientStore from "../../../../stores/vote/useVotePluginsClientStore";
import BaseDialog from "../../dialogs/BaseDialog";
import Field from "../../elements/Field";
import AccessibleButton from "../../elements/AccessibleButton";
import Spinner from "../../elements/Spinner";
import AccessibleTooltipButton from "../../elements/AccessibleTooltipButton";

interface VoteCommentModalProps {
  onFinished(): void;
  vote: YesNoVote;
  voterTokenRecord: ProgramAccount<TokenOwnerRecord>;
}

const VoteCommentModal: FunctionComponent<VoteCommentModalProps> = ({
  onFinished,
  vote,
  voterTokenRecord,
}) => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  );
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const wallet = useWalletStore((s) => s.current);
  const connection = useWalletStore((s) => s.connection);
  const { proposal } = useWalletStore((s) => s.selectedProposal);
  const { fetchChatMessages } = useWalletStore((s) => s.actions);
  const { realm, realmInfo } = useRealm();
  const { refetchProposals } = useWalletStore((s) => s.actions);

  const submitVote = async (vote: YesNoVote) => {
    setSubmitting(true);
    const rpcContext = new RpcContext(
      proposal!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection.current,
      connection.endpoint
    );

    const msg = comment
      ? new ChatMessageBody({
          type: ChatMessageBodyType.Text,
          value: comment,
        })
      : undefined;

    try {
      await castVote(
        rpcContext,
        realm!,
        proposal!,
        voterTokenRecord.pubkey,
        vote,
        msg,
        client
      );
      await refetchProposals();
    } catch (ex) {
      //TODO: How do we present transaction errors to users? Just the notification?
      console.error("Can't cast vote", ex);
      onFinished();
    } finally {
      setSubmitting(false);
      onFinished();
    }

    fetchChatMessages(proposal!.pubkey);
  };

  const voteString = vote === YesNoVote.Yes ? "Yes" : "No";

  return (
    <BaseDialog
      onFinished={onFinished}
      className="mx_VoteCommentModal"
      title="Confirm your vote"
    >
      <AccessibleTooltipButton
        title="This will be stored on-chain and displayed publically in the discussion on this proposal"
        onClick={null}
        className="mx_VoteCommentModal_description"
      >
        <div>Leave a comment (Optional)</div>
      </AccessibleTooltipButton>

      <Field
        className="mx_VoteCommentModal_commentField"
        value={comment}
        type="text"
        element="textarea"
        autoComplete="off"
        onChange={(e) => setComment(e.target.value)}
        // placeholder={`Let the DAO know why you vote '${voteString}'`}
      />

      <div className="mx_VoteCommentModal_buttonGroup">
        <AccessibleButton
          className="mx_VoteCommentModal_button cancel"
          onClick={onFinished}
        >
          Cancel
        </AccessibleButton>

        <AccessibleButton
          className="mx_VoteCommentModal_button vote"
          onClick={() => submitVote(vote)}
        >
          {submitting ? <Spinner /> : <span>Vote {voteString}</span>}
        </AccessibleButton>
      </div>
    </BaseDialog>
  );
};

export default VoteCommentModal;
