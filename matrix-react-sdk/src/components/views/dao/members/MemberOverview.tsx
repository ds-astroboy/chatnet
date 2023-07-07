import React, { useEffect, useMemo, useState } from "react";
import { getExplorerUrl } from "../explorer/tools";
import {
  ChatAltIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  XCircleIcon,
} from "@heroicons/react/outline";
import useRealm from "../../../../hooks/useRealm";
import { getVoteRecordsByVoterMapByProposal } from "../../../../apis/vote";
import { isYesVote } from "../../../../apis/voteRecords";
import { GOVERNANCE_CHAT_PROGRAM_ID, VoteRecord } from "@solana/spl-governance";
import { ChatMessage, ProgramAccount } from "@solana/spl-governance";
import { getGovernanceChatMessagesByVoter } from "@solana/spl-governance";

import { PublicKey } from "@solana/web3.js";
import { tryParsePublicKey } from "../../../../tools/core/pubkey";
import { accountsToPubkeyMap } from "../../../../tools/sdk/accounts";
import { fmtMintAmount } from "../../../../tools/sdk/units";
import { notify } from "../../../../utils/vote/notifications";
import tokenService from "../../../../utils/vote/services/token";
import { Member } from "../../../../utils/vote/uiTypes/members";
import useWalletStore from "../../../../stores/vote/useWalletStore";
import { WalletTokenRecordWithProposal } from "./types";
import useMembers from "./useMembers";
import PaginationComponent from "../Pagination";
import { trimString } from "../../../../hooks/trimString";

const MemberOverview = ({ member }: { member: Member }) => {
  const { realm } = useRealm();
  const connection = useWalletStore((s) => s.connection);
  const selectedRealm = useWalletStore((s) => s.selectedRealm);
  const { mint, councilMint, proposals, symbol } = useRealm();
  const { activeMembers } = useMembers();
  const [ownVoteRecords, setOwnVoteRecords] = useState<
    WalletTokenRecordWithProposal[]
  >([]);
  const [recentVotes, setRecentVotes] = useState<
    WalletTokenRecordWithProposal[]
  >([]);
  const { walletAddress, councilVotes, communityVotes, votesCasted } = member;

  const walletPublicKey = tryParsePublicKey(walletAddress);
  const tokenName = realm
    ? tokenService.getTokenInfo(realm?.account.communityMint.toBase58())?.symbol
    : "";
  const communityAmount = useMemo(
    () =>
      communityVotes && communityVotes && !communityVotes.isZero()
        ? fmtMintAmount(mint, communityVotes)
        : "",
    [walletAddress]
  );

  const councilAmount = useMemo(
    () =>
      councilVotes && councilVotes && !councilVotes.isZero()
        ? fmtMintAmount(councilMint, councilVotes)
        : "",
    [walletAddress]
  );

  const getVoteRecordsAndChatMsgs = async () => {
    let voteRecords: { [pubKey: string]: ProgramAccount<VoteRecord> } = {};
    let chatMessages: { [pubKey: string]: ProgramAccount<ChatMessage> } = {};
    try {
      const results = await Promise.all([
        getVoteRecordsByVoterMapByProposal(
          connection.current,
          selectedRealm!.programId!,
          new PublicKey(walletAddress)
        ),
        getGovernanceChatMessagesByVoter(
          connection!.current,
          GOVERNANCE_CHAT_PROGRAM_ID,
          new PublicKey(walletAddress)
        ),
      ]);
      voteRecords = results[0];
      chatMessages = accountsToPubkeyMap(results[1]);
    } catch (e) {
      notify({
        message: "Unable to fetch vote records for selected wallet address",
        type: "error",
      });
    }
    return { voteRecords, chat: chatMessages };
  };

  useEffect(() => {
    //we get voteRecords sorted by proposal date and match it with proposal name and chat msgs leaved by token holder.
    const handleSetVoteRecords = async () => {
      const { voteRecords, chat } = await getVoteRecordsAndChatMsgs();
      const voteRecordsArray: WalletTokenRecordWithProposal[] = Object.keys(
        voteRecords
      )
        .sort((a, b) => {
          const prevProposal = proposals[a];
          const nextProposal = proposals[b];
          return (
            prevProposal?.account.getStateTimestamp() -
            nextProposal?.account.getStateTimestamp()
          );
        })
        .reverse()
        .filter((x) => proposals[x])
        .flatMap((x) => {
          const currentProposal = proposals[x];
          const currentChatsMsgPk = Object.keys(chat).filter(
            (c) =>
              chat[c]?.account.proposal.toBase58() ===
              currentProposal?.pubkey.toBase58()
          );
          const currentChatMsgs = currentChatsMsgPk.map(
            (c) => chat[c].account.body.value
          );
          return {
            proposalPublicKey: x,
            proposalName: currentProposal?.account.name,
            chatMessages: currentChatMsgs,
            ...voteRecords[x],
          };
        });

      setOwnVoteRecords(voteRecordsArray);
    };
    handleSetVoteRecords();
  }, [walletAddress]);

  const memberVotePowerRank = useMemo(() => {
    const sortedMembers = activeMembers.sort(
      (a, b) => b.communityVotes.toNumber() - a.communityVotes.toNumber()
    );
    return (
      sortedMembers.findIndex(
        (m) => m.walletAddress === member?.walletAddress
      ) + 1
    );
  }, [JSON.stringify(activeMembers)]);

  useEffect(() => {
    setRecentVotes(paginateVotes(0));
  }, [JSON.stringify(ownVoteRecords)]);

  const perPage = 8;
  const totalPages = Math.ceil(ownVoteRecords.length / perPage);
  const onPageChange = (page) => {
    setRecentVotes(paginateVotes(page));
  };
  const paginateVotes = (page) => {
    return ownVoteRecords.slice(page * perPage, (page + 1) * perPage);
  };

  return (
    <div className="mx_MemberOverview">
      <div className="mx_MemberOverview_header">
        <div className="mx_MemberOverview_header_address">
          {trimString(walletPublicKey.toBase58())}
        </div>
        <a
          className="mx_MemberOverview_header_link"
          href={
            walletAddress
              ? getExplorerUrl(connection.endpoint, walletAddress)
              : ""
          }
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx_MemberOverview_header_link_content">Explorer</div>
          <ExternalLinkIcon className="mx_MemberOverview_header_link_icon" />
        </a>
      </div>
      <div className="mx_MemberOverview_subHeader">
        {(communityAmount || !councilAmount) && (
          <div className="mx_MemberOverview_voteTokenInfo">
            <div className="mx_MemberOverview_voteTokenInfo_name">
              {tokenName} Votes
            </div>
            <div className="mx_MemberOverview_voteTokenInfo_amount">
              {communityAmount || 0}
            </div>
            <div className="mx_MemberOverview_voteTokenInfo_rank">
              Vote Power Rank: {memberVotePowerRank}
            </div>
          </div>
        )}
        {councilAmount && (
          <div className="mx_MemberOverview_otherVoteTokenInfo">
            <div className="mx_MemberOverview_otherVoteTokenInfo_name">
              Council Votes
            </div>
            <div className="mx_MemberOverview_otherVoteTokenInfo_amount">
              {councilAmount}
            </div>
          </div>
        )}
        <div className="mx_MemberOverview_voteInfo">
          <div className="mx_MemberOverview_voteInfo_title">Votes Cast</div>
          <div className="mx_MemberOverview_voteInfo_count">
            {votesCasted}
          </div>
          <div className="mx_MemberOverview_voteInfo_result">
            Yes Votes:{" "}
            {ownVoteRecords.filter((v) => isYesVote(v.account))?.length}
            {" | "}
            No Votes:{" "}
            {ownVoteRecords.filter((v) => !isYesVote(v.account))?.length}
          </div>
        </div>
      </div>
      <div className="mx_MemberOverview_body">
        <div className="mx_MemberOverview_totlaVotes">
          {ownVoteRecords?.length} Recent Votes
        </div>
        <div className="mx_MemberOverview_proposals">
          {recentVotes.map((x) => (
            <a
              // href={fmtUrlWithCluster(
              //   `/dao/${symbol}/proposal/${x.proposalPublicKey}`
              // )}
              rel="noopener noreferrer"
              className="mx_MemberOverview_proposal"
              key={x.proposalPublicKey}
            >
              <div className="mx_MemberOverview_proposal_info">
                <div className="mx_MemberOverview_proposal_name">
                  {x.proposalName}
                </div>
                {isYesVote(x.account) ? (
                  <div className="mx_MemberOverview_proposal_result">
                    <CheckCircleIcon className="mx_MemberOverview_proposal_result_icon yes" />
                    <div className="mx_MemberOverview_proposal_result_content">
                      Voted Yes
                    </div>
                  </div>
                ) : (
                  <div className="mx_MemberOverview_proposal_result">
                    <XCircleIcon className="mx_MemberOverview_proposal_result_icon no" />
                    <div className="mx_MemberOverview_proposal_result_content">
                      Voted No
                    </div>
                  </div>
                )}
              </div>
              <div className="mx_MemberOverview_proposal_messages">
                {x.chatMessages?.length > 0 ? (
                  <>
                    {x.chatMessages.map((msg, index) => (
                      <div
                        className="mx_MemberOverview_proposal_message"
                        key={index}
                      >
                        <ChatAltIcon className="mx_MemberOverview_proposal_message_icon" />
                        <div className="mx_MemberOverview_proposal_message_content">
                          {msg}
                        </div>
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
            </a>
          ))}
        </div>
        <div>
          <PaginationComponent
            totalPages={totalPages}
            onPageChange={onPageChange}
          ></PaginationComponent>
        </div>
      </div>
    </div>
  );
};

export default MemberOverview;
