import { BN } from '@project-serum/anchor'
import { TokenOwnerRecord, VoteRecord } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'

export interface Member {
  walletAddress: string
  votesCasted: number
  councilVotes: BN
  communityVotes: BN
  hasCouncilTokenOutsideRealm?: boolean
  hasCommunityTokenOutsideRealm?: boolean
}

export enum ViewState {
  MainView,
  MemberOverview,
  AddMember,
}

export interface TokenRecordsWithWalletAddress {
  walletAddress: string
  council?: ProgramAccount<TokenOwnerRecord> | undefined
  community?: ProgramAccount<TokenOwnerRecord> | undefined
}

export interface WalletTokenRecordWithProposal
  extends ProgramAccount<VoteRecord> {
  proposalPublicKey: string
  proposalName: string
  chatMessages: string[]
}
