import { booleanFilter, ProgramAccount } from '@solana/spl-governance'
import { 
  getRealms,
  PROGRAM_VERSION_V1,
  getGovernanceAccounts, 
  pubkeyFilter, 
  Realm, 
  TokenOwnerRecord, 
  VoteRecord 
} from "@solana/spl-governance";
import { Connection, PublicKey } from "@solana/web3.js";
import { arrayToRecord } from "../tools/core/script";

export interface RealmInfo {
    symbol: string
    programId: PublicKey
    programVersion?: number
    realmId: PublicKey
    website?: string
    // Specifies the realm mainnet name for resource lookups
    // It's required for none mainnet environments when the realm name is different than on mainnet
    displayName?: string
    // Website keywords
    keywords?: string
    // twitter:site meta
    twitter?: string
    // og:image
    ogImage?: string
  
    // banner mage
    bannerImage?: string
  
    // Allow Realm to send email/SMS/Telegram/etc., notifications to governance members using Notifi
    enableNotifi?: boolean
  
    isCertified: boolean
  
    // 3- featured DAOs  ,2- new DAO with active proposals, 1- DAOs with active proposal,
    sortRank?: number
  
    // The default shared wallet of the DAO displayed on the home page
    // It's used for crowdfunding DAOs like  Ukraine.SOL or #Unchain_Ukraine
    sharedWalletId?: PublicKey
}

export async function getTokenOwnerRecordsForRealmMintMapByOwner(
    connection: Connection,
    programId: PublicKey,
    realmId: PublicKey,
    governingTokenMintPk: PublicKey | undefined
  ) {
    return governingTokenMintPk
      ? getGovernanceAccounts(connection, programId, TokenOwnerRecord, [
          pubkeyFilter(1, realmId)!,
          pubkeyFilter(1 + 32, governingTokenMintPk)!,
        ]).then((tors) =>
          arrayToRecord(tors, (tor) => tor.account.governingTokenOwner.toBase58())
        )
      : undefined
}

export async function getVoteRecordsByVoterMapByProposal(
    connection: Connection,
    programId: PublicKey,
    voter: PublicKey
) {
    return getGovernanceAccounts(connection, programId, VoteRecord, [
      pubkeyFilter(33, voter)!,
    ]).then((vrs) => arrayToRecord(vrs, (vr) => vr.account.proposal.toBase58()))
}

export async function getVoteRecordsByProposalMapByVoter(
    connection: Connection,
    programId: PublicKey,
    proposalPubKey: PublicKey
) {
    return getGovernanceAccounts(connection, programId, VoteRecord, [
      pubkeyFilter(1, proposalPubKey)!,
    ]).then((vrs) =>
      arrayToRecord(vrs, (vr) => vr.account.governingTokenOwner.toBase58())
    )
}

export function createUnchartedRealmInfo(realm: ProgramAccount<Realm>) {
    return {
      symbol: realm.account.name,
      programId: new PublicKey(realm.owner),
      realmId: realm.pubkey,
      displayName: realm.account.name,
      isCertified: false,
      enableNotifi: true, // enable by default
    } as RealmInfo
}

export async function getUnrelinquishedVoteRecords(
  connection: Connection,
  programId: PublicKey,
  tokenOwnerRecordPk: PublicKey
) {
  return getGovernanceAccounts(connection, programId, VoteRecord, [
    pubkeyFilter(1 + 32, tokenOwnerRecordPk)!,
    booleanFilter(1 + 32 + 32, false),
  ])
}

export function getProgramVersionForRealm(realmInfo: RealmInfo) {
  // TODO: as a temp fix V1 is returned by default
  return realmInfo?.programVersion ?? PROGRAM_VERSION_V1
}
